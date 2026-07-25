const { forbidden } = require('../utils/responseHelper');

const ROLES = {
  ADMIN: 'admin',
  EHS_MANAGER: 'ehs_manager',
  WORKER: 'worker',
};

const ROLE_HIERARCHY = {
  admin: 3,
  ehs_manager: 2,
  worker: 1,
};

/**
 * requireRole(...roles) — allow only users with one of the specified roles
 * Must be used AFTER authenticate middleware
 *
 * Usage: router.delete('/:id', authenticate, requireRole('admin', 'ehs_manager'), deleteSdsController)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};

/**
 * requireMinRole(minRole) — allow users with AT LEAST this role level
 */
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < minLevel) {
      return forbidden(res, `Minimum role required: ${minRole}`);
    }
    next();
  };
};

module.exports = { requireRole, requireMinRole, ROLES };
