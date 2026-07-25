'use strict';
const asyncHandler = require('../../utils/asyncHandler');
const { sendCopilotMessage, generateAutoFix, generateSafetySummary } = require('../../services/intelligence/complianceCopilotService');
const { autoFillFromCas, simulateConcentrationChange, optimizeFormulation, explainClassification } = require('../../services/intelligence/formulationIntelligenceService');
const sdsModel = require('../../models/sdsModel');
const mixturesModel = require('../../models/mixturesModel');
const chatModel = require('../../models/chatModel');
const { success, created, notFound, badRequest } = require('../../utils/responseHelper');

exports.copilotMessageController = asyncHandler(async (req, res) => {
  const { sdsId, message, sessionId, jurisdiction='US_OSHA', language='en' } = req.body;
  if(!sdsId||!message) return badRequest(res,'sdsId and message required');
  const sds = await sdsModel.findById(sdsId);
  if(!sds) return notFound(res,'SDS not found');
  const session = sessionId ? await chatModel.findSessionById(sessionId) : await chatModel.findOrCreateSession(req.user.userId, sdsId);
  const history = await chatModel.getHistory(session.id);
  const result = await sendCopilotMessage({ userMessage:message, sdsData:sds, conversationHistory:history, jurisdiction, language });
  await chatModel.addMessage({ session_id:session.id, role:'user', content:message, tokens_used:0 });
  await chatModel.addMessage({ session_id:session.id, role:'assistant', content:result.response, tokens_used:result.tokens_used });
  return success(res, { sessionId:session.id, message:result.response, auto_fixes:result.auto_fixes, has_compliance_issue:result.has_compliance_issue, has_auto_fix:result.has_auto_fix });
});
exports.autoFixController = asyncHandler(async (req, res) => {
  const { sdsId, section, field, issue, jurisdiction='US_OSHA' } = req.body;
  if(!sdsId||!section||!field) return badRequest(res,'sdsId, section, field required');
  const sds = await sdsModel.findById(sdsId);
  if(!sds) return notFound(res,'SDS not found');
  return success(res, await generateAutoFix(sds, { section, field, issue, jurisdiction }), 'Auto-fix generated');
});
exports.safetySummaryController = asyncHandler(async (req, res) => { const sds=await sdsModel.findById(req.params.sdsId); if(!sds)return notFound(res,'SDS not found'); return success(res,await generateSafetySummary(sds,req.query.language||sds.language||'en'),'Summary generated'); });
exports.casAutoFillController = asyncHandler(async (req, res) => { if(!req.params.cas)return badRequest(res,'CAS required'); return success(res,await autoFillFromCas(req.params.cas),'Data retrieved'); });
exports.simulateController = asyncHandler(async (req, res) => { const {components,newConcentrations}=req.body; if(!Array.isArray(components)||!Array.isArray(newConcentrations))return badRequest(res,'components and newConcentrations arrays required'); return success(res,await simulateConcentrationChange(components,newConcentrations),'Simulation complete'); });
exports.optimizeController = asyncHandler(async (req, res) => { const {mixtureId,goal,jurisdiction='US_OSHA'}=req.body; if(!mixtureId||!goal)return badRequest(res,'mixtureId and goal required'); const m=await mixturesModel.findById(mixtureId); if(!m)return notFound(res,'Mixture not found'); return success(res,await optimizeFormulation(m.components||[],goal,jurisdiction),'Optimization complete'); });
exports.explainController = asyncHandler(async (req, res) => { const {classification,context={}}=req.body; if(!classification)return badRequest(res,'classification required'); return success(res,await explainClassification(classification,context),'Explained'); });
