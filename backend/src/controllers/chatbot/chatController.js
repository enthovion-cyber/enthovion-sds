const chatModel = require('../../models/chatModel');
const sdsModel = require('../../models/sdsModel');
const { sendMessage } = require('../../services/ai/chatbotService');
const { success, notFound, badRequest } = require('../../utils/responseHelper');

const chatController = async (req, res) => {
  const { sdsId, message, sessionId, language = 'en' } = req.body;

  // Load SDS document for context
  const sds = await sdsModel.findById(sdsId);
  if (!sds) return notFound(res, 'SDS document not found');

  // Get or create chat session
  const session = sessionId
    ? await chatModel.findSessionById(sessionId)
    : await chatModel.findOrCreateSession(req.user.userId, sdsId);

  if (!session) return badRequest(res, 'Chat session not found');

  // Load conversation history
  const history = await chatModel.getHistory(session.id);

  // Get AI response
  const aiResult = await sendMessage({
    userMessage: message,
    sdsData: sds,
    conversationHistory: history,
    language,
  });

  // Persist user message and AI response
  await chatModel.addMessage({
    session_id: session.id,
    role: 'user',
    content: message,
    tokens_used: 0,
  });

  await chatModel.addMessage({
    session_id: session.id,
    role: 'assistant',
    content: aiResult.response,
    tokens_used: aiResult.tokensUsed,
  });

  return success(res, {
    sessionId: session.id,
    message: aiResult.response,
    structured: aiResult.structured || null,
    autoFixAvailable: Boolean(aiResult.structured?.action_label),
    model: aiResult.model,
  });
};

module.exports = chatController;
