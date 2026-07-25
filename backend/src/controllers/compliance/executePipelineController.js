const { enqueueUnifiedPipeline } = require("../../services/compliance/unifiedPipelineService");
const { success, badRequest } = require("../../utils/responseHelper");

const executePipelineController = async (req, res) => {
  const { inputType, sdsId, mixtureId, chemical } = req.body || {};

  if (!inputType) return badRequest(res, "inputType is required");
  if (!["sds", "mixture", "chemical"].includes(inputType)) {
    return badRequest(res, "Invalid inputType. Use sds, mixture, or chemical.");
  }
  if (inputType === "sds" && !sdsId) return badRequest(res, "sdsId is required");
  if (inputType === "mixture" && !mixtureId) return badRequest(res, "mixtureId is required");
  if (inputType === "chemical" && !chemical) return badRequest(res, "chemical is required");

  const task = await enqueueUnifiedPipeline({
    userId: req.user.userId,
    input: { inputType, sdsId, mixtureId, chemical },
  });

  return success(
    res,
    {
      id: task.id,
      type: task.type,
      status: "started",
      pipeline:
        "Input -> Extract -> Normalize -> Classify -> Validate -> Auto-Fix -> Re-Validate -> Generate -> Label -> Approval -> Output",
      input: { inputType, sdsId, mixtureId, chemical: chemical || null },
    },
    "Unified compliance pipeline started"
  );
};

module.exports = executePipelineController;
