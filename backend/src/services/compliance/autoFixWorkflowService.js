const sdsModel = require("../../models/sdsModel");
const labelsModel = require("../../models/labelsModel");
const sopModel = require("../../models/sopModel");
const {
  extractLabelData,
} = require("../ai/labelGeneratorService");
const { generateSop } = require("../ai/sopGeneratorService");
const {
  evaluateSingleSds,
} = require("./continuousComplianceService");
const {
  createTask,
  updateTask,
  incrementTaskAttempt,
  getTaskById,
  listTasksByUser,
  listAllTasks,
} = require("./workflowTaskService");
const {
  createNotification,
} = require("../notifications/notificationService");
const { sendWorkflowWebhook } = require("../notifications/webhookService");

const RETRY_BACKOFF_MS = [30 * 1000, 2 * 60 * 1000, 10 * 60 * 1000];

const buildWorkflowRoute = ({ task, metadata = {} }) => {
  if (metadata.route) return metadata.route;
  if (task?.id) return `/pipeline?taskId=${task.id}`;
  if (task?.sds_id) return `/sds/${task.sds_id}`;
  return '/pipeline';
};

const appendTaskEvent = async (taskId, event) => {
  const task = await getTaskById(taskId);
  if (!task) return;
  const history = task.output?.attempt_history || [];
  await updateTask(taskId, {
    output: {
      ...(task.output || {}),
      attempt_history: [
        ...history,
        { ...event, at: new Date().toISOString() },
      ],
    },
  });
};

const notifyWorkflowEvent = async ({ task, type, title, message, metadata = {} }) => {
  await createNotification({
    user_id: task.user_id,
    type,
    title,
    message,
    metadata: {
      task_id: task.id,
      sds_id: task.sds_id,
      route: buildWorkflowRoute({ task, metadata }),
      ...metadata,
    },
  });
  await sendWorkflowWebhook({
    event: type,
    payload: {
      task_id: task.id,
      user_id: task.user_id,
      sds_id: task.sds_id,
      ...metadata,
    },
  });
};

const applyBasicFixes = (sdsDoc, suggestions = []) => {
  const sections = { ...(sdsDoc.sections || {}) };

  // Minimal deterministic fixes to keep workflow safe and explainable.
  if (!sections.section16) {
    sections.section16 = {
      title: "Other Information",
      content: {},
      confidence: 70,
      issues: ["auto-created by auto-fix workflow"],
    };
  }
  const sec16Content = sections.section16.content || {};
  sections.section16.content = {
    ...sec16Content,
    revision_date: new Date().toISOString().slice(0, 10),
    auto_fix_note: `Auto-fix applied with ${suggestions.length} recommendations`,
  };

  return sections;
};

const buildSectionDiffPreview = (oldSections = {}, newSections = {}) => {
  const changed = [];
  const keys = new Set([...Object.keys(oldSections), ...Object.keys(newSections)]);
  keys.forEach((k) => {
    const before = JSON.stringify(oldSections[k] || null);
    const after = JSON.stringify(newSections[k] || null);
    if (before !== after) {
      changed.push({
        section: k,
        before_preview: before?.slice(0, 300) || "",
        after_preview: after?.slice(0, 300) || "",
      });
    }
  });
  return changed;
};

const processAutoFixTask = async (taskId) => {
  const task = await getTaskById(taskId);
  if (!task) return;

  try {
    await incrementTaskAttempt(taskId);
    await appendTaskEvent(taskId, { event: "attempt_started", status: "processing" });
    await updateTask(taskId, { status: "processing", progress: 10 });
    const sds = await sdsModel.findById(task.sds_id);
    if (!sds) throw new Error("SDS not found");

    const evaluated = evaluateSingleSds(sds);
    await updateTask(taskId, { progress: 30 });

    const patchedSections = applyBasicFixes(
      sds,
      evaluated.auto_fix_suggestions || []
    );
    const sectionDiff = buildSectionDiffPreview(sds.sections || {}, patchedSections);

    await updateTask(taskId, {
      status: "pending_review",
      progress: 100,
      output: {
        sds_id: sds.id,
        current_status: evaluated.status,
        auto_fix_suggestions: evaluated.auto_fix_suggestions || [],
        section_diff_preview: sectionDiff,
        proposed_sections: patchedSections,
      },
    });
    await appendTaskEvent(taskId, { event: "attempt_ready_for_review", status: "pending_review" });
    await notifyWorkflowEvent({
      task,
      type: "workflow_review",
      title: "Auto-fix requires review",
      message: `Task ${task.id.slice(0, 8)} is ready for approve/reject.`,
      metadata: { status: "pending_review" },
    });
  } catch (err) {
    const fresh = await getTaskById(taskId);
    const attempts = fresh?.attempts || 1;
    const maxAttempts = fresh?.max_attempts || 3;
    const hasRetry = attempts < maxAttempts;
    if (hasRetry) {
      const backoff = RETRY_BACKOFF_MS[Math.min(attempts - 1, RETRY_BACKOFF_MS.length - 1)];
      const nextRetryAt = new Date(Date.now() + backoff).toISOString();
      await updateTask(taskId, {
        status: "retry_scheduled",
        progress: 0,
        error: err.message,
        next_retry_at: nextRetryAt,
      });
      await appendTaskEvent(taskId, {
        event: "attempt_failed_retry_scheduled",
        status: "retry_scheduled",
        error: err.message,
        retry_at: nextRetryAt,
      });
      setTimeout(() => {
        processAutoFixTask(taskId);
      }, backoff);
    } else {
      await updateTask(taskId, {
        status: "dead_letter",
        progress: 100,
        error: err.message,
        dead_lettered_at: new Date().toISOString(),
      });
      await appendTaskEvent(taskId, {
        event: "attempt_failed_dead_letter",
        status: "dead_letter",
        error: err.message,
        attempts,
      });
      await notifyWorkflowEvent({
        task,
        type: "workflow_dead_letter",
        title: "Auto-fix moved to dead letter",
        message: `Task ${task.id.slice(0, 8)} failed after ${attempts} attempts.`,
        metadata: { attempts, status: "dead_letter" },
      });
    }
  }
};

const enqueueAutoFixTask = async ({ userId, sdsId }) => {
  const task = await createTask({
    type: "auto_fix_sds",
    user_id: userId,
    sds_id: sdsId,
    input: { regenerate_label: true, regenerate_sop: true },
  });
  setTimeout(() => {
    processAutoFixTask(task.id);
  }, 50);
  return task;
};

const requeueAutoFixTask = async ({ taskId, requestedBy }) => {
  const task = await getTaskById(taskId);
  if (!task) throw new Error("Task not found");
  if (!["failed", "dead_letter", "rejected"].includes(task.status)) {
    throw new Error("Only failed, dead_letter, or rejected tasks can be requeued");
  }

  await updateTask(taskId, {
    status: "queued",
    progress: 0,
    error: null,
    next_retry_at: null,
    dead_lettered_at: null,
  });

  setTimeout(() => {
    processAutoFixTask(taskId);
  }, 50);

  await appendTaskEvent(taskId, {
    event: "task_requeued",
    status: "queued",
    requested_by: requestedBy,
  });
  await notifyWorkflowEvent({
    task,
    type: "workflow_requeued",
    title: "Auto-fix task requeued",
    message: `Task ${task.id.slice(0, 8)} was requeued for processing.`,
    metadata: { requested_by: requestedBy, status: "queued" },
  });

  return await getTaskById(taskId);
};

const approveAutoFixTask = async ({ taskId, approvedBy }) => {
  const task = await getTaskById(taskId);
  if (!task) throw new Error("Task not found");
  if (task.user_id === approvedBy) {
    throw new Error("Maker-checker policy: creator cannot self-approve");
  }
  if (task.status !== "pending_review") {
    throw new Error("Only pending_review tasks can be approved");
  }
  const sds = await sdsModel.findById(task.sds_id);
  if (!sds) throw new Error("SDS not found");
  const proposedSections = task.output?.proposed_sections;
  if (!proposedSections) throw new Error("No proposed sections in task output");

  const updatedSds = await sdsModel.update(task.sds_id, {
    sections: proposedSections,
    status: sds.status === "approved" ? "approved" : "draft",
  });

  const regeneratedLabel = await labelsModel.create({
    sds_id: updatedSds.id,
    user_id: task.user_id,
    size: "medium",
    language: updatedSds.language || "en",
    label_data: extractLabelData(updatedSds),
  });

  let regeneratedSop = null;
  try {
    const sopContent = await generateSop({
      sdsData: updatedSds,
      language: updatedSds.language || "en",
      type: "handling",
      sdsId: updatedSds.id,
    });
    regeneratedSop = await sopModel.create({
      sds_id: updatedSds.id,
      user_id: task.user_id,
      language: updatedSds.language || "en",
      type: "handling",
      title: sopContent.title || `SOP - ${updatedSds.chemical_name}`,
      content: sopContent,
      is_rtl: sopContent.is_rtl || false,
      status: "draft",
      ai_model: "gpt-4o",
      tokens_used: sopContent.tokens_used || 0,
    });
  } catch (err) {
    regeneratedSop = { warning: `SOP regeneration skipped: ${err.message}` };
  }

  await updateTask(taskId, {
    status: "completed",
    output: {
      ...task.output,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      sds_id: updatedSds.id,
      compliance_status_after_fix: evaluateSingleSds(updatedSds).status,
      regenerated_label_id: regeneratedLabel.id,
      regenerated_sop: regeneratedSop?.id || regeneratedSop,
    },
  });
  await appendTaskEvent(taskId, {
    event: "task_approved_completed",
    status: "completed",
    approved_by: approvedBy,
  });
  await notifyWorkflowEvent({
    task,
    type: "workflow_completed",
    title: "Auto-fix applied",
    message: `Task ${task.id.slice(0, 8)} approved and completed.`,
    metadata: { approved_by: approvedBy, status: "completed" },
  });
  return await getTaskById(taskId);
};

const rejectAutoFixTask = async ({ taskId, rejectedBy, reason }) => {
  const task = await getTaskById(taskId);
  if (!task) throw new Error("Task not found");
  if (task.status !== "pending_review") {
    throw new Error("Only pending_review tasks can be rejected");
  }
  await updateTask(taskId, {
    status: "rejected",
    output: {
      ...task.output,
      rejected_by: rejectedBy,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || "Rejected by reviewer",
    },
  });
  await appendTaskEvent(taskId, {
    event: "task_rejected",
    status: "rejected",
    rejected_by: rejectedBy,
    reason: reason || "Rejected by reviewer",
  });
  await notifyWorkflowEvent({
    task,
    type: "workflow_rejected",
    title: "Auto-fix rejected",
    message: `Task ${task.id.slice(0, 8)} was rejected by reviewer.`,
    metadata: { rejected_by: rejectedBy, status: "rejected" },
  });
  return await getTaskById(taskId);
};

module.exports = {
  enqueueAutoFixTask,
  approveAutoFixTask,
  rejectAutoFixTask,
  requeueAutoFixTask,
  getTaskById,
  listTasksByUser,
  listAllTasks,
};
