/**
 * middleware/errorHandler.js
 * Last-resort error handler. Route handlers should catch their own
 * expected errors (bad input, wrong password, etc.) and respond
 * directly — this only catches things that slip through.
 */

export function notFound(req, res) {
  res.status(404).json({ error: `No route: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err)
  const status = err.status || 500
  res.status(status).json({
    error: status === 500 ? 'Something went wrong on our end.' : err.message,
  })
}
