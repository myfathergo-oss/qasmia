/**
 * /api/student/* — Student-only routes (read-only own data)
 */
import { Router, Response } from 'express'
import { query, queryOne } from '../db/index'
import { authenticate, AuthRequest } from '../middleware/auth'

export const studentRouter = Router()
studentRouter.use(authenticate)

// Only allow student role
function studentOnly(req: AuthRequest, res: Response, next: () => void) {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Student access only' })
  }
  next()
}

// Helper – get student record linked to logged-in user
async function getMyStudent(userId: string) {
  return queryOne<any>(`
    SELECT s.* FROM students s
    JOIN users u ON u.student_ref_id = s.id
    WHERE u.id = $1
  `, [userId])
}

// ── GET /api/student/my-profile ───────────────────────────────
studentRouter.get('/my-profile', studentOnly, async (req: AuthRequest, res: Response) => {
  const student = await getMyStudent(req.user!.id)
  if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })
  res.json({ success: true, data: student })
})

// ── GET /api/student/my-stats ─────────────────────────────────
studentRouter.get('/my-stats', studentOnly, async (req: AuthRequest, res: Response) => {
  const student = await getMyStudent(req.user!.id)
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' })

  const thisMonth = new Date().toISOString().slice(0, 7)

  const [attRows, lastProgress, feeRow] = await Promise.all([
    // Attendance this month
    query<any>(`
      SELECT status, COUNT(*)::int AS cnt
      FROM attendance
      WHERE student_id = $1 AND TO_CHAR(date,'YYYY-MM') = $2
      GROUP BY status
    `, [student.id, thisMonth]),

    // Last quran progress entry
    queryOne<any>(`
      SELECT sabaq_surah, sabaq_para, sabaq_verse_start, sabaq_verse_end, date
      FROM daily_quran_progress
      WHERE student_id = $1
      ORDER BY date DESC LIMIT 1
    `, [student.id]),

    // Current fee balance
    queryOne<any>(`
      SELECT COALESCE(SUM(balance_due),0) AS balance_due,
             COALESCE(SUM(paid_amount),0) AS paid_amount
      FROM fee_invoices WHERE student_id = $1
    `, [student.id]),
  ])

  const presentDays = attRows.find((r: any) => r.status === 'present')?.cnt ?? 0
  const absentDays  = attRows.find((r: any) => r.status === 'absent')?.cnt ?? 0
  const totalDays   = attRows.reduce((s: number, r: any) => s + r.cnt, 0)
  const pct         = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const lastSabaq = lastProgress
    ? [lastProgress.sabaq_surah, lastProgress.sabaq_para ? `Para ${lastProgress.sabaq_para}` : '',
       lastProgress.sabaq_verse_start ? `v.${lastProgress.sabaq_verse_start}-${lastProgress.sabaq_verse_end}` : '']
        .filter(Boolean).join(' · ')
    : ''

  res.json({
    success: true,
    data: {
      totalPresentDays:    presentDays,
      totalAbsentDays:     absentDays,
      attendancePercent:   pct,
      lastSabaq,
      lastSabaqDate:       lastProgress?.date ?? '',
      totalMemoized:       '',    // can extend later
      balanceDue:          parseFloat(feeRow?.balance_due ?? '0'),
    }
  })
})

// ── GET /api/student/my-attendance?month= ────────────────────
studentRouter.get('/my-attendance', studentOnly, async (req: AuthRequest, res: Response) => {
  const student = await getMyStudent(req.user!.id)
  if (!student) return res.status(404).json({ success: false, message: 'Not found' })

  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7)

  const rows = await query(`
    SELECT a.id, a.date, a.status, a.note
    FROM attendance a
    WHERE a.student_id = $1
      AND TO_CHAR(a.date, 'YYYY-MM') = $2
    ORDER BY a.date DESC
  `, [student.id, month])

  res.json({ success: true, data: rows })
})

// ── GET /api/student/my-progress?month= ──────────────────────
studentRouter.get('/my-progress', studentOnly, async (req: AuthRequest, res: Response) => {
  const student = await getMyStudent(req.user!.id)
  if (!student) return res.status(404).json({ success: false, message: 'Not found' })

  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7)

  const rows = await query(`
    SELECT p.*
    FROM daily_quran_progress p
    WHERE p.student_id = $1
      AND TO_CHAR(p.date, 'YYYY-MM') = $2
    ORDER BY p.date DESC
  `, [student.id, month])

  // Map snake_case → camelCase for frontend
  const mapped = rows.map((r: any) => ({
    id:                r.id,
    studentId:         r.student_id,
    classId:           r.class_id,
    ustadId:           r.ustad_id,
    date:              r.date,
    attendanceStatus:  r.attendance_status,
    sabaqSurah:        r.sabaq_surah,
    sabaqPara:         r.sabaq_para,
    sabaqVerseStart:   r.sabaq_verse_start,
    sabaqVerseEnd:     r.sabaq_verse_end,
    sabaqPageStart:    r.sabaq_page_start,
    sabaqPageEnd:      r.sabaq_page_end,
    sabaqAssessment:   r.sabaq_assessment,
    sabqiPortion:      r.sabqi_portion,
    sabqiCompleted:    r.sabqi_completed,
    sabqiAssessment:   r.sabqi_assessment,
    manzilPortion:     r.manzil_portion,
    manzilCompleted:   r.manzil_completed,
    manzilAssessment:  r.manzil_assessment,
    mistakes:          r.mistakes,
    fluency:           r.fluency,
    tajweed:           r.tajweed,
    ustadNotes:        r.ustad_notes,
    createdAt:         r.created_at,
  }))

  res.json({ success: true, data: mapped })
})

// ── GET /api/student/my-fees ──────────────────────────────────
studentRouter.get('/my-fees', studentOnly, async (req: AuthRequest, res: Response) => {
  const student = await getMyStudent(req.user!.id)
  if (!student) return res.status(404).json({ success: false, message: 'Not found' })

  const invoices = await query<any>(`
    SELECT f.*,
      COALESCE(
        json_agg(fi ORDER BY fi.id) FILTER (WHERE fi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM fee_invoices f
    LEFT JOIN fee_items fi ON fi.invoice_id = f.id
    WHERE f.student_id = $1
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `, [student.id])

  // Map snake_case → camelCase
  const mapped = invoices.map((inv: any) => ({
    id:            inv.id,
    invoiceNumber: inv.invoice_number,
    studentId:     inv.student_id,
    month:         inv.month,
    items:         (inv.items ?? []).map((it: any) => ({
      id:          it.id,
      description: it.description,
      amount:      parseFloat(it.amount),
      type:        it.type,
    })),
    totalAmount:   parseFloat(inv.total_amount),
    paidAmount:    parseFloat(inv.paid_amount),
    balanceDue:    parseFloat(inv.balance_due),
    status:        inv.status,
    dueDate:       inv.due_date,
    createdAt:     inv.created_at,
  }))

  res.json({ success: true, data: mapped })
})
