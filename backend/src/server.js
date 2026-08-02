import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './routes/auth.routes.js'
import goalRoutes from './routes/goals.routes.js'
import sheetRoutes from './routes/sheets.routes.js'
import achievementRoutes from './routes/achievements.routes.js'
import cycleRoutes from './routes/cycles.routes.js'
import userRoutes from './routes/users.routes.js'
import reportRoutes from './routes/reports.routes.js'
import auditRoutes from './routes/audit.routes.js'
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

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/sheets', sheetRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/cycles', cycleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/audit', auditRoutes)

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stratify API running' })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Stratify API running on port ${PORT}`)
})

export default app
