import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { query, queryOne } from '../db/index'
import { authenticate, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const progressRouter = Router()
progressRouter.use(authenticate)

// GET /api/quran-progress?studentId=&classId=&date=
progressRouter.get('/', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { studentId, classId, date, page='1', pageSize='20' } = req.query as Record<string,string>
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  let sql = `
    SELECT p.*, s.full_name, s.student_id AS student_id_code, u.full_name AS ustad_name
    FROM daily_quran_progress p
    JOIN students s ON s.id = p.student_id
    JOIN users u ON u.id = p.ustad_id
    WHERE 1=1
  `
  const params: any[] = []
  let i = 1
  if (studentId) { sql += ` AND p.student_id = $${i++}`; params.push(studentId) }
  if (classId)   { sql += ` AND p.class_id = $${i++}`;   params.push(classId) }
  if (date)      { sql += ` AND p.date = $${i++}`;        params.push(date) }
  if (req.user!.role === 'ustad') {
    sql += ` AND p.class_id = ANY($${i++})`
    params.push(req.user!.assignedClasses)
  }
  sql += ` ORDER BY p.date DESC, s.full_name LIMIT $${i++} OFFSET $${i++}`
  params.push(parseInt(pageSize), offset)
  const items = await query(sql, params)
  res.json({ success: true, data: { items } })
})

// POST /api/quran-progress
progressRouter.post('/',
  isAdminOrUstad,
  body('studentId').isUUID(),
  body('classId').isUUID(),
  body('date').isDate(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const b = req.body
    const row = await queryOne<any>(`
      INSERT INTO daily_quran_progress
        (student_id, class_id, ustad_id, date, attendance_status,
         sabaq_surah, sabaq_para, sabaq_verse_start, sabaq_verse_end, sabaq_page_start, sabaq_page_end, sabaq_assessment,
         sabqi_portion, sabqi_completed, sabqi_assessment,
         manzil_portion, manzil_completed, manzil_assessment,
         mistakes, fluency, tajweed, ustad_notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      ON CONFLICT (student_id, class_id, date)
      DO UPDATE SET
        sabaq_surah=$6, sabaq_para=$7, sabaq_verse_start=$8, sabaq_verse_end=$9,
        sabaq_page_start=$10, sabaq_page_end=$11, sabaq_assessment=$12,
        sabqi_portion=$13, sabqi_completed=$14, sabqi_assessment=$15,
        manzil_portion=$16, manzil_completed=$17, manzil_assessment=$18,
        mistakes=$19, fluency=$20, tajweed=$21, ustad_notes=$22
      RETURNING *
    `, [
      b.studentId, b.classId, req.user!.id, b.date, b.attendanceStatus ?? 'present',
      b.sabaqSurah ?? null, b.sabaqPara ?? null, b.sabaqVerseStart ?? null, b.sabaqVerseEnd ?? null,
      b.sabaqPageStart ?? null, b.sabaqPageEnd ?? null, b.sabaqAssessment ?? null,
      b.sabqiPortion ?? null, b.sabqiCompleted ?? false, b.sabqiAssessment ?? null,
      b.manzilPortion ?? null, b.manzilCompleted ?? false, b.manzilAssessment ?? null,
      b.mistakes ?? 0, b.fluency ?? null, b.tajweed ?? null, b.ustadNotes ?? null,
    ])
    res.status(201).json({ success: true, data: row })
  }
)
