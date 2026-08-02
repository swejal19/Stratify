export const errorHandler = (err, req, res, next) => {
  // Always log full stack server-side for debugging
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.stack)

  const status = err.status || err.statusCode || 500

  // In production, don't leak internal error details on 5xx
  const message =
    status < 500
      ? err.message || 'Bad Request'
      : process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error'

  res.status(status).json({ success: false, message })
}
