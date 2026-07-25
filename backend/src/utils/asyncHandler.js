/**
 * Wraps async route handlers so thrown errors flow to Express error middleware.
 * Eliminates try/catch boilerplate in every controller.
 *
 * Usage:  router.post('/login', asyncHandler(loginController));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
