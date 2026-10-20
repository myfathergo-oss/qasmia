import { Router, Response } from 'express'
import { query, queryOne } from '../db/index'
import { authenticate, isAdmin, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const classesRouter = Router()
classesRouter.use(authenticate)

classesRouter.get('/', isAdminOrUstad, async (_req, res: Response) => {
  const rows = await query(`
    SELECT c.*, u.full_name AS ustad_name, COUNT(s.id)::int AS student_count
    FROM classes c
    LEFT JOIN users u ON u.id = c.assigned_ustad_id
    LEFT JOIN students s ON s.class_id = c.id AND s.enrollment_status = 'active'
    WHERE c.is_active = TRUE
    GROUP BY c.id, u.full_name
    ORDER BY c.name
  `)
  res.json({ success: true, data: rows })
})

classesRouter.post('/', isAdmin, async (req: AuthRequest, res: Response) => {
  const b = req.body
  const row = await queryOne<any>(`
    INSERT INTO classes (name, name_urdu, type, assigned_ustad_id, academic_year)
    VALUES ($1,$2,$3,$4,$5) RETURNING *
  `, [b.name, b.nameUrdu ?? null, b.type ?? 'general', b.assignedUstadId ?? null, b.academicYear ?? null])
  res.status(201).json({ success: true, data: row })
})
