const { success } = require("../../utils/responseHelper");
const {
  listNotifications,
} = require("../../services/notifications/notificationService");

const getNotificationsController = async (req, res) => {
  const limit = parseInt(req.query.limit || "30", 10);
  const notifications = await listNotifications(req.user.userId, { limit });
  return success(res, notifications);
};

module.exports = getNotificationsController;
