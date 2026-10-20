import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { query, queryOne } from '../db/index'
import { authenticate, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const attendanceRouter = Router()
attendanceRouter.use(authenticate)

// GET /api/attendance?classId=&date=
attendanceRouter.get('/', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { classId, date, studentId } = req.query as Record<string,string>
  let sql = `
    SELECT a.*, s.full_name, s.student_id AS student_id_code, s.class_id,
           u.full_name AS marked_by_name
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = a.marked_by
    WHERE 1=1
  `
  const params: any[] = []
  let i = 1
  if (classId)   { sql += ` AND a.class_id = $${i++}`;    params.push(classId) }
  if (date)      { sql += ` AND a.date = $${i++}`;         params.push(date) }
  if (studentId) { sql += ` AND a.student_id = $${i++}`;  params.push(studentId) }
  sql += ' ORDER BY s.full_name'
  const rows = await query(sql, params)
  res.json({ success: true, data: rows })
})

// POST /api/attendance/bulk
attendanceRouter.post('/bulk',
  isAdminOrUstad,
  body('classId').isUUID(),
  body('date').isDate(),
  body('records').isArray({ min: 1 }),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const { classId, date, records } = req.body

    // Authorization: ustads only mark their own classes
    if (req.user!.role === 'ustad' && !req.user!.assignedClasses.includes(classId)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this class' })
    }

    const inserted: any[] = []
    for (const rec of records) {
      const row = await queryOne<any>(`
        INSERT INTO attendance (student_id, class_id, date, status, note, marked_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (student_id, class_id, date)
        DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note,
                      corrected_by = $6, corrected_at = NOW()
        RETURNING *
      `, [rec.studentId, classId, date, rec.status, rec.note ?? null, req.user!.id])
      if (row) inserted.push(row)
    }

    res.json({ success: true, data: inserted, message: `${inserted.length} records saved` })
  }
)

// GET /api/attendance/summary?classId=&month=
attendanceRouter.get('/summary', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { classId, month } = req.query as Record<string,string>
  const rows = await query(`
    SELECT s.id, s.full_name, s.student_id AS student_id_code,
      COUNT(*) FILTER (WHERE a.status = 'present') AS present_days,
      COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_days,
      COUNT(*) FILTER (WHERE a.status = 'late') AS late_days,
      COUNT(*) FILTER (WHERE a.status = 'approved_leave') AS leave_days,
      COUNT(*) AS total_records
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id AND TO_CHAR(a.date,'YYYY-MM') = $2
    WHERE s.class_id = $1
    GROUP BY s.id ORDER BY s.full_name
  `, [classId, month ?? new Date().toISOString().slice(0,7)])
  res.json({ success: true, data: rows })
})
