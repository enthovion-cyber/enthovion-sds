const chatModel = require('../../models/chatModel');
const { success } = require('../../utils/responseHelper');

const chatHistoryController = async (req, res) => {
  const { sdsId } = req.params;
  const sessions = await chatModel.getSessionsByUser(req.user.userId, sdsId);

  // For the most recent session, also load the messages
  let messages = [];
  if (sessions.length > 0) {
    messages = await chatModel.getHistory(sessions[0].id, 50);
  }

  return success(res, { sessions, messages });
};

module.exports = chatHistoryController;
