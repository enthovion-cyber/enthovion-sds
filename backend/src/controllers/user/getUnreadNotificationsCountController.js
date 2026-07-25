const { success } = require("../../utils/responseHelper");
const { getUnreadCount } = require("../../services/notifications/notificationService");

const getUnreadNotificationsCountController = async (req, res) => {
  const count = await getUnreadCount(req.user.userId);
  return success(res, { unread: count });
};

module.exports = getUnreadNotificationsCountController;
