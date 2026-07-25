const sdsModel = require("../../models/sdsModel");
const mixturesModel = require("../../models/mixturesModel");
const { scoreDocument } = require("../validation/aiValidationService");
const { validateCompliance, detectConflicts } = require("./regulatoryEngine");
const { extractLabelData } = require("../ai/labelGeneratorService");
const { openai } = require("../ai/openaiService");
const {
  createTask,
  updateTask,
  incrementTaskAttempt,
  getTaskById,
} = require("./workflowTaskService");
const { createNotification } = require("../notifications/notificationService");
const { sendWorkflowWebhook } = require("../notifications/webhookService");
const { normalizeSdsDocument } = require("./pipelineNormalizationService");

const RETRY_BACKOFF_MS = [20 * 1000, 90 * 1000, 5 * 60 * 1000];
const MAX_AUTO_FIX_LOOPS = 3;
const PIPELINE_SLA_TARGET_MS = 120000;

const STEP_NAMES = [
  "input",
  "extract",
  "normalize",
  "classify",
  "validate_quick",
  "auto_fix",
  "revalidate",
  "generate",
  "label",
  "approval",
  "output",
];

const toStepState = (state = "pending", details = "") => ({
  state,
  details,
  at: new Date().toISOString(),
});

const makeRuleTrace = (stage, rule, details = {}) => ({
  id: `RULE-${stage.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  stage,
  rule,
  details,
  at: new Date().toISOString(),
});

const buildInitialSteps = () =>
  STEP_NAMES.reduce((acc, step) => {
    acc[step] = toStepState("pending");
    return acc;
  }, {});

const inferRiskLevel = (score = 0, critical = 0) => {
  if (critical > 0 || score < 60) return "high";
  if (score < 85) return "medium";
  return "low";
};

const pickAction = (risk) => {
  if (risk === "high") return "mandatory_review";
  if (risk === "medium") return "review_recommended";
  return "ready_for_publish";
};

const normalizeInput = async ({ inputType, sdsId, mixtureId, chemical }) => {
  if (inputType === "sds") {
    const sds = await sdsModel.findById(sdsId);
    if (!sds) throw new Error("SDS not found");
    return {
      input: { type: "sds", id: sds.id },
      normalized: {
        chemical_name: sds.chemical_name,
        cas_number: sds.cas_number,
        language: sds.language || "en",
        jurisdiction: sds.jurisdiction || "US_OSHA",
        sections: sds.sections || {},
      },
      sdsId: sds.id,
    };
  }

  if (inputType === "mixture") {
    const mixture = await mixturesModel.findById(mixtureId);
    if (!mixture) throw new Error("Mixture not found");
    return {
      input: { type: "mixture", id: mixture.id },
      normalized: {
        chemical_name: mixture.name,
        jurisdiction: mixture.jurisdiction || "US_OSHA",
        language: "en",
        sections: {
          section1: { title: "Identification", content: { product_identifier: mixture.name } },
          section3: {
            title: "Composition / Information on Ingredients",
            content: {
              substance_or_mixture: "Mixture",
              ingredients: (mixture.components || []).map((c) => ({
                component: c.chemical_name,
                cas: c.cas_number,
                concentration: c.concentration_percent,
              })),
            },
          },
        },
      },
      sdsId: null,
    };
  }

  if (inputType === "chemical") {
    const name = String(chemical || "").trim();
    if (!name) throw new Error("Chemical input is required");
    return {
      input: { type: "chemical", value: name },
      normalized: {
        chemical_name: name,
        jurisdiction: "US_OSHA",
        language: "en",
        sections: {
          section1: {
            title: "Identification",
            content: {
              product_identifier: name,
              supplier_name: "Not determined",
              emergency_phone: "Not determined",
            },
          },
        },
      },
      sdsId: null,
    };
  }

  throw new Error("Invalid inputType. Use sds, mixture, or chemical.");
};

const ruleClassify = (doc) => {
  const section2 = doc.sections?.section2?.content || {};
  const classes = [].concat(section2.ghs_classification || []);
  const statements = [].concat(section2.hazard_statements || []);
  const signalWord = section2.signal_word || (classes.length ? "WARNING" : "Not determined");
  return {
    hazard_classes: classes,
    h_statements: statements,
    signal_word: signalWord,
    explainability: {
      rule_engine: true,
      rule_basis: "Existing SDS hazard section with conflict cross-checking",
      no_ai_used: true,
      rule_trace: [
        makeRuleTrace("classify", "section2_hazard_projection", {
          class_count: classes.length,
          statement_count: statements.length,
        }),
      ],
    },
  };
};

const autoFillMissingSectionsWithAi = async (doc, missingItems = []) => {
  const sections = { ...(doc.sections || {}) };
  const missingSectionNumbers = Array.from(
    new Set(
      missingItems
        .map((m) => String(m.section || ""))
        .filter((s) => s.startsWith("section"))
        .map((s) => Number(s.replace("section", "")))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 16)
    )
  );

  for (const n of missingSectionNumbers) {
    const key = `section${n}`;
    if (sections[key]) continue;
    sections[key] = {
      title: `Section ${n}`,
      content: { auto_generated: true, notes: "Generated by AI auto-fix engine" },
    };
  }

  if (!missingSectionNumbers.length) return sections;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Fill missing SDS sections in JSON only. Missing: ${missingSectionNumbers.join(", ")}. Existing sections: ${JSON.stringify(sections)}.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(response.choices?.[0]?.message?.content || "{}");
    if (parsed.sections && typeof parsed.sections === "object") return parsed.sections;
  } catch (_) {}

  return sections;
};

const runAutoFixLoop = async (doc, quickResult, deepResult) => {
  let workingDoc = { ...doc, sections: { ...(doc.sections || {}) } };
  let lastQuick = quickResult;
  let lastDeep = deepResult;
  const fixes = [];

  for (let i = 0; i < MAX_AUTO_FIX_LOOPS; i += 1) {
    const stillMissing = (lastQuick.missing_items || []).length;
    const stillCritical = Number(lastQuick.critical_count || 0);
    if (stillMissing === 0 && stillCritical === 0 && Number(lastDeep.score || 0) >= 90) break;

    const nextSections = await autoFillMissingSectionsWithAi(
      workingDoc,
      lastQuick.missing_items || []
    );
    workingDoc = { ...workingDoc, sections: nextSections };

    fixes.push({
      loop: i + 1,
      action: "fill_missing_sections_and_fields",
      missing_before: stillMissing,
      critical_before: stillCritical,
      by: "ai",
    });

    lastQuick = scoreDocument(workingDoc);
    lastDeep = await validateCompliance(workingDoc, workingDoc.jurisdiction || "US_OSHA");
  }

  return { fixedDoc: workingDoc, quick: lastQuick, deep: lastDeep, fixes };
};

const setStep = (steps, stepName, state, details) => {
  steps[stepName] = toStepState(state, details);
};

const markStepStart = (stepMetrics, stepName) => {
  stepMetrics[stepName] = {
    ...(stepMetrics[stepName] || {}),
    started_at: new Date().toISOString(),
  };
};

const markStepEnd = (stepMetrics, stepName) => {
  const now = new Date();
  const startedAt = stepMetrics?.[stepName]?.started_at
    ? new Date(stepMetrics[stepName].started_at)
    : now;
  stepMetrics[stepName] = {
    ...(stepMetrics[stepName] || {}),
    ended_at: now.toISOString(),
    duration_ms: Math.max(0, now.getTime() - startedAt.getTime()),
  };
};

const processUnifiedPipeline = async (taskId) => {
  const task = await getTaskById(taskId);
  if (!task) return;
  const steps = buildInitialSteps();
  const logs = [];
  const stepMetrics = {};
  const pipelineStartedAt = new Date();

  try {
    await incrementTaskAttempt(taskId);
    await updateTask(taskId, {
      status: "processing",
      progress: 5,
      output: { steps, logs, pipeline: "Input -> Extract -> Normalize -> Classify -> Validate -> Auto-fix -> Re-Validate -> Generate -> Label -> Approval -> Output" },
    });

    markStepStart(stepMetrics, "input");
    setStep(steps, "input", "completed", "Pipeline job created");
    markStepEnd(stepMetrics, "input");
    logs.push("Input accepted and pipeline started");

    markStepStart(stepMetrics, "extract");
    setStep(steps, "extract", "processing", "Extracting source payload");
    const normalizedInput = await normalizeInput(task.input || {});
    setStep(steps, "extract", "completed", "Source extracted");
    markStepEnd(stepMetrics, "extract");
    await updateTask(taskId, { progress: 15, output: { ...(task.output || {}), steps, logs } });

    markStepStart(stepMetrics, "normalize");
    setStep(steps, "normalize", "processing", "Normalizing to standard JSON schema");
    const doc = normalizeSdsDocument(normalizedInput.normalized);
    setStep(steps, "normalize", "completed", "Data normalized");
    markStepEnd(stepMetrics, "normalize");
    logs.push("Normalization completed (units/schema normalization stage)");
    await updateTask(taskId, { progress: 25, output: { ...(task.output || {}), steps, logs } });

    markStepStart(stepMetrics, "classify");
    setStep(steps, "classify", "processing", "Applying rule-based hazard classification");
    const hazard = ruleClassify(doc);
    setStep(steps, "classify", "completed", "Rule-based classification completed (no AI)");
    markStepEnd(stepMetrics, "classify");
    logs.push("Classification executed via rules only");
    await updateTask(taskId, { progress: 35, output: { ...(task.output || {}), steps, logs } });

    markStepStart(stepMetrics, "validate_quick");
    setStep(steps, "validate_quick", "processing", "Running quick + deep validation");
    const quick = scoreDocument(doc);
    const deep = await validateCompliance(doc, doc.jurisdiction || "US_OSHA");
    const conflicts = detectConflicts(doc);
    const validationRuleTrace = [
      makeRuleTrace("validate", "quick_completeness_scoring", {
        overall_score: quick.overall_score,
        critical_count: quick.critical_count,
      }),
      makeRuleTrace("validate", "deep_regulatory_scoring", {
        score: deep.score,
        jurisdiction: deep.jurisdiction,
      }),
    ];
    setStep(steps, "validate_quick", "completed", "Validation completed");
    markStepEnd(stepMetrics, "validate_quick");
    await updateTask(taskId, { progress: 50, output: { ...(task.output || {}), steps, logs } });

    markStepStart(stepMetrics, "auto_fix");
    setStep(steps, "auto_fix", "processing", "Running auto-fix loop");
    const autoFix = await runAutoFixLoop(doc, quick, deep);
    setStep(
      steps,
      "auto_fix",
      "completed",
      `Auto-fix loops: ${autoFix.fixes.length}`
    );
    markStepEnd(stepMetrics, "auto_fix");
    logs.push(`Auto-fix applied ${autoFix.fixes.length} loop(s)`);
    await updateTask(taskId, { progress: 65, output: { ...(task.output || {}), steps, logs } });

    markStepStart(stepMetrics, "revalidate");
    setStep(steps, "revalidate", "processing", "Re-validating after auto-fix");
    const reQuick = autoFix.quick;
    const reDeep = autoFix.deep;
    const risk = inferRiskLevel(reDeep.score, reQuick.critical_count);
    setStep(steps, "revalidate", "completed", `Compliance score: ${reDeep.score}`);
    markStepEnd(stepMetrics, "revalidate");
    await updateTask(taskId, { progress: 75, output: { ...(task.output || {}), steps, logs } });

    markStepStart(stepMetrics, "generate");
    setStep(steps, "generate", "processing", "Building final standardized SDS payload");
    const generatedSds = {
      chemical_name: autoFix.fixedDoc.chemical_name,
      cas_number: autoFix.fixedDoc.cas_number || null,
      jurisdiction: autoFix.fixedDoc.jurisdiction || "US_OSHA",
      language: autoFix.fixedDoc.language || "en",
      sections: autoFix.fixedDoc.sections || {},
    };
    setStep(steps, "generate", "completed", "SDS generation complete");
    markStepEnd(stepMetrics, "generate");

    markStepStart(stepMetrics, "label");
    setStep(steps, "label", "processing", "Generating synced label package");
    const label = extractLabelData(generatedSds);
    setStep(steps, "label", "completed", "Label generated and synced");
    markStepEnd(stepMetrics, "label");

    markStepStart(stepMetrics, "approval");
    setStep(steps, "approval", "processing", "Applying maker-checker policy");
    const action = pickAction(risk);
    const approvalState = action === "mandatory_review" || action === "review_recommended"
      ? "needs_review"
      : "auto_publish_ready";
    setStep(steps, "approval", "completed", `Approval state: ${approvalState}`);
    markStepEnd(stepMetrics, "approval");

    markStepStart(stepMetrics, "output");
    setStep(steps, "output", "completed", "Pipeline output prepared");
    markStepEnd(stepMetrics, "output");

    const pipelineEndedAt = new Date();
    const totalDurationMs = Math.max(0, pipelineEndedAt.getTime() - pipelineStartedAt.getTime());

    const status = approvalState === "auto_publish_ready" ? "completed" : "pending_review";
    const finalOutput = {
      pipeline_version: "master-flow-v1",
      steps,
      logs,
      input: normalizedInput.input,
      outputs: {
        hazard_profile: hazard,
        quick_validation: reQuick,
        deep_validation: reDeep,
        conflicts,
        auto_fix: {
          loops: autoFix.fixes,
          final_score: reDeep.score,
        },
        sds: generatedSds,
        label,
      },
      explainability: {
        ai_used_for: ["auto-fix missing section generation"],
        rules_used_for: ["classification", "validation", "compliance checks"],
        rule_trace: [
          ...(hazard.explainability?.rule_trace || []),
          ...validationRuleTrace,
          makeRuleTrace("approval", "risk_threshold_policy", {
            risk,
            action,
          }),
        ],
      },
      approval: {
        state: approvalState,
        risk,
        action,
      },
      normalization: doc.normalization_meta || null,
      metrics: {
        started_at: pipelineStartedAt.toISOString(),
        ended_at: pipelineEndedAt.toISOString(),
        total_duration_ms: totalDurationMs,
        sla_target_ms: PIPELINE_SLA_TARGET_MS,
        sla_breached: totalDurationMs > PIPELINE_SLA_TARGET_MS,
        step_metrics: stepMetrics,
      },
    };

    await updateTask(taskId, {
      status,
      progress: 100,
      output: finalOutput,
      sds_id: normalizedInput.sdsId || task.sds_id || null,
      error: null,
    });

    await createNotification({
      user_id: task.user_id,
      type: status === "completed" ? "pipeline_complete" : "approval_required",
      title: status === "completed" ? "Pipeline complete" : "Pipeline requires review",
      message: status === "completed"
        ? `Pipeline ${task.id.slice(0, 8)} completed successfully.`
        : `Pipeline ${task.id.slice(0, 8)} needs reviewer approval.`,
      metadata: { task_id: task.id, route: `/pipeline?taskId=${task.id}` },
    });
    await sendWorkflowWebhook({
      event: status === "completed" ? "pipeline.completed" : "pipeline.review_required",
      payload: { task_id: task.id, user_id: task.user_id, risk },
    });
  } catch (error) {
    const fresh = await getTaskById(taskId);
    const attempts = fresh?.attempts || 1;
    const maxAttempts = fresh?.max_attempts || 3;
    const hasRetry = attempts < maxAttempts;

    if (hasRetry) {
      const backoff = RETRY_BACKOFF_MS[Math.min(attempts - 1, RETRY_BACKOFF_MS.length - 1)];
      await updateTask(taskId, {
        status: "retry_scheduled",
        progress: 0,
        error: error.message,
        next_retry_at: new Date(Date.now() + backoff).toISOString(),
      });
      setTimeout(() => processUnifiedPipeline(taskId), backoff);
      return;
    }

    await updateTask(taskId, {
      status: "dead_letter",
      progress: 100,
      error: error.message,
      dead_lettered_at: new Date().toISOString(),
    });

    await createNotification({
      user_id: task.user_id,
      type: "validation_failed",
      title: "Pipeline failed",
      message: `Pipeline ${task.id.slice(0, 8)} moved to dead-letter queue.`,
      metadata: { task_id: task.id, route: `/pipeline?taskId=${task.id}` },
    });
    await sendWorkflowWebhook({
      event: "validation.failed",
      payload: { task_id: task.id, user_id: task.user_id, error: error.message },
    });
  }
};

const enqueueUnifiedPipeline = async ({ userId, input }) => {
  const task = await createTask({
    type: "unified_pipeline",
    user_id: userId,
    sds_id: input.sdsId || null,
    input,
  });
  setTimeout(() => processUnifiedPipeline(task.id), 50);
  return task;
};

module.exports = {
  enqueueUnifiedPipeline,
};

