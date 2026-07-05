/**
 * utils/asyncHandler.js
 * Express 4 doesn't catch rejected promises in async route handlers —
 * this forwards any thrown/rejected error to the central error handler.
 */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
