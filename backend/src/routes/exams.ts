import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { query, queryOne } from '../db/index'
import { authenticate, isAdmin, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const examsRouter = Router()
examsRouter.use(authenticate)

examsRouter.get('/', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { classId, published } = req.query as Record<string,string>
  let sql = `SELECT e.*, c.name AS class_name FROM exams e JOIN classes c ON c.id = e.class_id WHERE 1=1`
  const params: any[] = []
  let i = 1
  if (classId)   { sql += ` AND e.class_id = $${i++}`; params.push(classId) }
  if (published) { sql += ` AND e.published = $${i++}`; params.push(published === 'true') }
  sql += ' ORDER BY e.date DESC'
  res.json({ success: true, data: { items: await query(sql, params) } })
})

examsRouter.post('/', isAdmin,
  body('title').trim().notEmpty(),
  body('classId').isUUID(),
  body('date').isDate(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const b = req.body
    const row = await queryOne<any>(`
      INSERT INTO exams (title, category, class_id, date, total_marks, passing_marks, syllabus, published, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `, [b.title, b.category ?? 'monthly', b.classId, b.date, b.totalMarks ?? 100, b.passingMarks ?? 40, b.syllabus ?? null, false, req.user!.id])
    res.status(201).json({ success: true, data: row })
  }
)

// POST /api/exams/:id/results – bulk enter marks
examsRouter.post('/:id/results', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { results } = req.body  // [{ studentId, marksObtained, remarks }]
  if (!Array.isArray(results)) return res.status(400).json({ success: false, message: 'results must be array' })
  const saved: any[] = []
  for (const r of results) {
    const totalRow = await queryOne<any>(`SELECT total_marks FROM exams WHERE id = $1`, [req.params.id])
    const grade = totalRow ? computeGrade(r.marksObtained, totalRow.total_marks) : null
    const row = await queryOne<any>(`
      INSERT INTO exam_results (exam_id, student_id, marks_obtained, grade, remarks, entered_by)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (exam_id, student_id) DO UPDATE
        SET marks_obtained=$3, grade=$4, remarks=$5 RETURNING *
    `, [req.params.id, r.studentId, r.marksObtained, grade, r.remarks ?? null, req.user!.id])
    if (row) saved.push(row)
  }
  res.json({ success: true, data: saved })
})

// PATCH /api/exams/:id/publish
examsRouter.patch('/:id/publish', isAdmin, async (_req, res: Response) => {
  const row = await queryOne<any>(`UPDATE exams SET published=TRUE WHERE id=$1 RETURNING *`, [_req.params.id])
  if (!row) return res.status(404).json({ success: false, message: 'Exam not found' })
  res.json({ success: true, data: row })
})

function computeGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100
  if (pct >= 90) return 'A+'; if (pct >= 80) return 'A'
  if (pct >= 70) return 'B';  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D';  return 'F'
}
