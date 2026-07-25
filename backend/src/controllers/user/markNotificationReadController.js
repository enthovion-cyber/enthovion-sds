const { success, notFound } = require("../../utils/responseHelper");
const {
  markNotificationRead,
} = require("../../services/notifications/notificationService");

const markNotificationReadController = async (req, res) => {
  const updated = await markNotificationRead({
    userId: req.user.userId,
    notificationId: req.params.id,
  });
  if (!updated) return notFound(res, "Notification not found");
  return success(res, updated, "Notification marked as read");
};

module.exports = markNotificationReadController;
