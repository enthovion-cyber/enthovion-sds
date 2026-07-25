const sopModel = require('../../models/sopModel');
const { paginated } = require('../../utils/responseHelper');

const getAllSopsController = async (req, res) => {
  try {
    const { page = 1, limit = 20, language, type, sdsId } = req.query;

    // 1. Debugging: Log the user ID to ensure it exists
    console.log('Fetching SOPs for User:', req.user.userId);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { data, total } = await sopModel.findAll({
      userId: req.user.userId,
      page: parseInt(page),
      limit: parseInt(limit),
      language,
      type,
      sdsId,
    });

    return paginated(res, data, total, page, limit);

  } catch (error) {
    // 2. This log is CRITICAL. It will show you the EXACT error in your terminal.
    console.error('CRASH IN getAllSopsController:', error.message);
    
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

module.exports = getAllSopsController;