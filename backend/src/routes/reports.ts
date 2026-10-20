import { Router, Response } from 'express'
import { query, queryOne } from '../db/index'
import { authenticate, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const reportsRouter = Router()
reportsRouter.use(authenticate)

// GET /api/reports/attendance?classId=&month=
reportsRouter.get('/attendance', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { classId, month } = req.query as Record<string,string>
  const rows = await query(`
    SELECT s.student_id AS student_id_code, s.full_name,
      COUNT(*) FILTER (WHERE a.status = 'present') AS present,
      COUNT(*) FILTER (WHERE a.status = 'absent') AS absent,
      COUNT(*) FILTER (WHERE a.status = 'late') AS late,
      COUNT(*) FILTER (WHERE a.status = 'approved_leave') AS leave,
      COUNT(*) AS total_days
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id AND TO_CHAR(a.date,'YYYY-MM') = $2
    WHERE s.class_id = $1 AND s.enrollment_status = 'active'
    GROUP BY s.id ORDER BY s.full_name
  `, [classId, month ?? new Date().toISOString().slice(0,7)])
  res.json({ success: true, data: rows })
})

// GET /api/reports/progress/:studentId?month=
reportsRouter.get('/progress/:studentId', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { month } = req.query as Record<string,string>
  const rows = await query(`
    SELECT p.*, s.full_name, s.student_id AS student_id_code
    FROM daily_quran_progress p
    JOIN students s ON s.id = p.student_id
    WHERE p.student_id = $1
      AND ($2::text IS NULL OR TO_CHAR(p.date,'YYYY-MM') = $2)
    ORDER BY p.date
  `, [req.params.studentId, month ?? null])
  res.json({ success: true, data: rows })
})

// GET /api/reports/exam-results/:examId
reportsRouter.get('/exam-results/:examId', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const rows = await query(`
    SELECT er.*, s.full_name, s.student_id AS student_id_code, e.title, e.total_marks
    FROM exam_results er
    JOIN students s ON s.id = er.student_id
    JOIN exams e ON e.id = er.exam_id
    WHERE er.exam_id = $1
    ORDER BY er.marks_obtained DESC
  `, [req.params.examId])
  res.json({ success: true, data: rows })
})
