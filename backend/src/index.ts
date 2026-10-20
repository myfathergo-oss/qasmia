import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'

import { authRouter }       from './routes/auth'
import { studentsRouter }   from './routes/students'
import { classesRouter }    from './routes/classes'
import { attendanceRouter } from './routes/attendance'
import { progressRouter }   from './routes/progress'
import { examsRouter }      from './routes/exams'
import { feesRouter }       from './routes/fees'
import { newsRouter }       from './routes/news'
import { dashboardRouter }  from './routes/dashboard'
import { reportsRouter }    from './routes/reports'
import { studentRouter }    from './routes/student'
import { errorHandler }     from './middleware/errorHandler'
import { checkFirstRun }    from './middleware/firstRun'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// ── Security middleware ────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(compression() as any)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting ──────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  standardHeaders: true, legacyHeaders: false })
app.use('/api', limiter)
app.use('/api/auth/login', authLimiter)

// ── Static file uploads ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Qasmia API', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',        authRouter)
app.use('/api/dashboard',   dashboardRouter)
app.use('/api/students',    studentsRouter)
app.use('/api/classes',     classesRouter)
app.use('/api/attendance',  attendanceRouter)
app.use('/api/quran-progress', progressRouter)
app.use('/api/exams',       examsRouter)
app.use('/api/fees',        feesRouter)
app.use('/api/news',        newsRouter)
app.use('/api/reports',     reportsRouter)
app.use('/api/student',     studentRouter)    // student self-service routes

// ── 404 ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── Error handler ──────────────────────────────────────────────
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🕌  Qasmia API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`)
  try {
    await checkFirstRun()
  } catch (e) {
    console.warn('First-run check skipped (DB not connected):', (e as Error).message)
  }
})

export default app
