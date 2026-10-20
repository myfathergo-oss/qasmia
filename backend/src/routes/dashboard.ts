import { Router, Response } from 'express'
import { queryOne, query } from '../db/index'
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth'

export const dashboardRouter = Router()
dashboardRouter.use(authenticate)

dashboardRouter.get('/admin-stats', isAdmin, async (_req, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().toISOString().slice(0,7)

  const [students, classes, ustads, todayAtt, progress, upcomingExams, overdueFees] = await Promise.all([
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM students WHERE enrollment_status = 'active'`),
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM classes WHERE is_active = TRUE`),
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM users WHERE role = 'ustad' AND is_active = TRUE`),
    query<{ status: string; count: string }>(`SELECT status, COUNT(*) FROM attendance WHERE date = $1 GROUP BY status`, [today]),
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM daily_quran_progress WHERE date = $1`, [today]),
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM exams WHERE date >= $1 AND date <= (NOW() + interval '7 days')::date AND published = FALSE`, [today]),
    queryOne<{ count: string }>(`SELECT COUNT(*) FROM fee_invoices WHERE status IN ('pending','overdue') AND month = $1`, [thisMonth]),
  ])

  const presentCount = todayAtt.find(r => r.status === 'present')?.count ?? '0'
  const totalStudents = parseInt(students?.count ?? '0')
  const pct = totalStudents > 0 ? Math.round((parseInt(presentCount) / totalStudents) * 100) : 0

  res.json({
    success: true,
    data: {
      totalStudents,
      totalClasses:              parseInt(classes?.count ?? '0'),
      totalUstads:               parseInt(ustads?.count ?? '0'),
      todayPresentCount:         parseInt(presentCount),
      todayAttendancePercent:    pct,
      recentProgressEntries:     parseInt(progress?.count ?? '0'),
      upcomingExams:             parseInt(upcomingExams?.count ?? '0'),
      overdueFeesCount:          parseInt(overdueFees?.count ?? '0'),
    }
  })
})
