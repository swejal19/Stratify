/**
 * authorize
 * Variadic role guard — pass one or more allowed roles as arguments.
 * Must be used after the `protect` middleware so req.user is populated.
 *
 * Usage:
 *   router.post('/register', protect, authorize('admin'), register)
 *   router.get('/reports', protect, authorize('admin', 'manager'), handler)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized`,
      })
    }
    next()
  }
}
