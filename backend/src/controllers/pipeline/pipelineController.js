'use strict';
const asyncHandler = require('../../utils/asyncHandler');
const { runUploadPipeline, runGeneratePipeline } = require('../../services/intelligence/unifiedPipelineService');
const { success, created, badRequest } = require('../../utils/responseHelper');

exports.uploadPipelineController = asyncHandler(async (req, res) => {
  if(!req.file) return badRequest(res,'No file uploaded');
  const { jurisdiction='US_OSHA', language='en', autoGenerateSop='false' } = req.body;
  const result = await runUploadPipeline({ fileBuffer:req.file.buffer, fileName:req.file.originalname, userId:req.user.userId, jurisdiction, language, autoGenerateSop:autoGenerateSop==='true' });
  return created(res, result, `Pipeline complete in ${(result.duration_ms/1000).toFixed(1)}s`);
});
exports.generatePipelineController = asyncHandler(async (req, res) => {
  const { chemicalInput, jurisdiction='US_OSHA', language='en', generateLabel=true, generateSop=true } = req.body;
  if(!chemicalInput||(!chemicalInput.chemicalName&&!chemicalInput.casNumber)) return badRequest(res,'Provide chemicalName or casNumber');
  const result = await runGeneratePipeline({ chemicalInput, userId:req.user.userId, jurisdiction, language, generateLabel, generateSopFlag:generateSop });
  return created(res, result, `Pipeline complete in ${(result.duration_ms/1000).toFixed(1)}s`);
});
