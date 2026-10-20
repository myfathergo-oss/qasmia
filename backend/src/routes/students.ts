import { Router, Response } from 'express'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import { query, queryOne, getNextSeq } from '../db/index'
import { authenticate, isAdmin, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const studentsRouter = Router()
studentsRouter.use(authenticate)

// ── GET /api/students ─────────────────────────────────────────
studentsRouter.get('/', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { classId, search, status = 'active', page = '1', pageSize = '20' } = req.query as Record<string, string>
  const offset = (parseInt(page) - 1) * parseInt(pageSize)

  let sql = `
    SELECT s.*, c.name AS class_name
    FROM students s
    LEFT JOIN classes c ON c.id = s.class_id
    WHERE 1=1
  `
  const params: any[] = []
  let i = 1

  // Ustads only see their assigned classes
  if (req.user!.role === 'ustad') {
    sql += ` AND s.class_id = ANY($${i++})`
    params.push(req.user!.assignedClasses)
  }
  if (classId)              { sql += ` AND s.class_id = $${i++}`;          params.push(classId) }
  if (status !== 'all')     { sql += ` AND s.enrollment_status = $${i++}`; params.push(status) }
  if (search)               { sql += ` AND (s.full_name ILIKE $${i} OR s.student_id ILIKE $${i++})`; params.push(`%${search}%`) }

  const countRow = await queryOne<{ count: string }>(`SELECT COUNT(*) FROM (${sql}) t`, params)
  const total    = parseInt(countRow?.count ?? '0')

  sql += ` ORDER BY s.full_name LIMIT $${i++} OFFSET $${i++}`
  params.push(parseInt(pageSize), offset)
  const items = await query(sql, params)

  res.json({ success: true, data: { items, total, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(total / parseInt(pageSize)) } })
})

// ── POST /api/students  (admit + create login account) ────────
studentsRouter.post('/',
  isAdmin,
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('guardianName').trim().notEmpty().withMessage('Guardian name is required'),
  body('classId').isUUID().withMessage('Valid class ID required'),
  body('loginPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const b = req.body

    // 1 – Generate student ID (QSM-001, QSM-002 …)
    const seqVal    = await getNextSeq('student_seq')
    const studentId = `QSM-${String(seqVal).padStart(3, '0')}`

    // 2 – Insert student record
    const student = await queryOne<any>(`
      INSERT INTO students
        (student_id, full_name, full_name_urdu, date_of_birth, gender,
         class_id, enrollment_date, guardian_name, guardian_phone,
         guardian_relation, address, notes, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [
      studentId,
      b.fullName,
      b.fullNameUrdu         ?? null,
      b.dateOfBirth          ?? null,
      b.gender               ?? 'male',
      b.classId,
      b.enrollmentDate       ?? new Date().toISOString().split('T')[0],
      b.guardianName,
      b.guardianPhone        ?? null,
      b.guardianRelation     ?? null,
      b.address              ?? null,
      b.notes                ?? null,
      req.user!.id,
    ])

    // 3 – Hash password and create login account for the student
    const passwordHash = await bcrypt.hash(b.loginPassword, 12)

    await queryOne(`
      INSERT INTO users
        (username, password_hash, full_name, full_name_urdu, role,
         must_change_password, lang, student_ref_id)
      VALUES ($1, $2, $3, $4, 'student', FALSE, 'en', $5)
      ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash
    `, [
      studentId,           // username = QSM-001
      passwordHash,
      b.fullName,
      b.fullNameUrdu ?? null,
      student!.id,         // links user → student record
    ])

    res.status(201).json({ success: true, data: student })
  }
)

// ── GET /api/students/:id ─────────────────────────────────────
studentsRouter.get('/:id', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const s = await queryOne<any>(`
    SELECT s.*, c.name AS class_name
    FROM students s
    LEFT JOIN classes c ON c.id = s.class_id
    WHERE s.id = $1
  `, [req.params.id])

  if (!s) return res.status(404).json({ success: false, message: 'Student not found' })
  res.json({ success: true, data: s })
})

// ── PUT /api/students/:id ─────────────────────────────────────
studentsRouter.put('/:id', isAdmin, async (req: AuthRequest, res: Response) => {
  const b = req.body
  const s = await queryOne<any>(`
    UPDATE students
    SET full_name=$1, full_name_urdu=$2, date_of_birth=$3, gender=$4,
        class_id=$5, enrollment_date=$6, enrollment_status=$7,
        guardian_name=$8, guardian_phone=$9, guardian_relation=$10,
        address=$11, notes=$12, updated_at=NOW()
    WHERE id=$13 RETURNING *
  `, [
    b.fullName, b.fullNameUrdu, b.dateOfBirth, b.gender,
    b.classId,  b.enrollmentDate, b.enrollmentStatus ?? 'active',
    b.guardianName, b.guardianPhone, b.guardianRelation,
    b.address, b.notes, req.params.id,
  ])
  if (!s) return res.status(404).json({ success: false, message: 'Student not found' })
  res.json({ success: true, data: s })
})

// ── PATCH /api/students/:id/reset-password  (Ustad resets) ───
studentsRouter.patch('/:id/reset-password',
  isAdminOrUstad,
  body('newPassword').isLength({ min: 6 }),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const student = await queryOne<any>(`SELECT student_id FROM students WHERE id = $1`, [req.params.id])
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' })

    const hash = await bcrypt.hash(req.body.newPassword, 12)
    await queryOne(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE username=$2`,
      [hash, student.student_id])

    res.json({ success: true, message: 'Password reset successfully' })
  }
)
