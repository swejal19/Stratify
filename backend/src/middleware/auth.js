import { verifyToken } from '../config/jwt.js'
import { supabase } from '../config/db.js'

/**
 * protect
 * Verifies the Bearer JWT and fetches a fresh profile row from Supabase.
 * Attaches the full profile object to req.user for downstream handlers.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    // Always fetch a fresh profile so role/department changes take effect immediately
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.id)
      .single()

    if (error || !profile) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    req.user = profile
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}
