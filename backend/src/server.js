import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
dotenv.config()

import authRoutes from './routes/auth.routes.js'
import goalRoutes from './routes/goals.routes.js'
import sheetRoutes from './routes/sheets.routes.js'
import achievementRoutes from './routes/achievements.routes.js'
import cycleRoutes from './routes/cycles.routes.js'
import userRoutes from './routes/users.routes.js'
import reportRoutes from './routes/reports.routes.js'
import auditRoutes from './routes/audit.routes.js'
import accessRequestRoutes from './routes/accessRequest.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)
app.use(morgan('dev'))
app.use(express.json())

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Stratify API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

app.head('/health', (req, res) => {
  res.status(200).end()
})

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Tier 1 — Global limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: 'Too many requests, please try again later' 
  }
})

// Tier 2 — Auth limit (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: 'Too many login attempts, please wait 15 minutes' 
  }
})

// Tier 3 — Admin limit
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: 'Too many admin requests, please slow down' 
  }
})

// Apply BEFORE route declarations
app.use('/api', globalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/admin', adminLimiter)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/sheets', sheetRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/cycles', cycleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api', accessRequestRoutes)

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stratify API running' })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Stratify API running on port ${PORT}`)
})

export default app
