import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { query, queryOne, getNextSeq } from '../db/index'
import { authenticate, isAdmin, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const feesRouter = Router()
feesRouter.use(authenticate)

feesRouter.get('/invoices', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { studentId, status, month } = req.query as Record<string,string>
  let sql = `
    SELECT f.*, s.full_name, s.student_id AS student_id_code
    FROM fee_invoices f JOIN students s ON s.id = f.student_id WHERE 1=1
  `
  const params: any[] = []
  let i = 1
  if (studentId) { sql += ` AND f.student_id = $${i++}`; params.push(studentId) }
  if (status)    { sql += ` AND f.status = $${i++}`;     params.push(status) }
  if (month)     { sql += ` AND f.month = $${i++}`;      params.push(month) }
  sql += ' ORDER BY f.created_at DESC'
  res.json({ success: true, data: { items: await query(sql, params) } })
})

feesRouter.post('/invoices', isAdmin,
  body('studentId').isUUID(),
  body('totalAmount').isNumeric(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const b = req.body
    const invSeq       = await getNextSeq('invoice_seq')
    const invoiceNumber = `INV-${String(invSeq).padStart(4, '0')}`
    const row = await queryOne<any>(`
      INSERT INTO fee_invoices (invoice_number, student_id, month, total_amount, balance_due, status, due_date, created_by)
      VALUES ($1,$2,$3,$4,$4,$5,$6,$7) RETURNING *
    `, [invoiceNumber, b.studentId, b.month ?? null, b.totalAmount, b.status ?? 'pending', b.dueDate ?? null, req.user!.id])

    // Insert items
    if (Array.isArray(b.items)) {
      for (const item of b.items) {
        await queryOne(`INSERT INTO fee_items (invoice_id, description, amount, type) VALUES ($1,$2,$3,$4)`,
          [row!.id, item.description, item.amount, item.type ?? 'monthly_fee'])
      }
    }
    res.status(201).json({ success: true, data: row })
  }
)

feesRouter.post('/invoices/:id/payments', isAdminOrUstad,
  body('amount').isNumeric({ no_symbols: false }),
  body('method').isIn(['cash','bank_transfer','easypaisa','jazzcash']),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const invoice = await queryOne<any>(`SELECT * FROM fee_invoices WHERE id = $1`, [req.params.id])
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' })

    const amount = parseFloat(req.body.amount)
    const rcpSeq       = await getNextSeq('receipt_seq')
    const receiptNumber = `RCP-${String(rcpSeq).padStart(4, '0')}`

    const payment = await queryOne<any>(`
      INSERT INTO payments (invoice_id, receipt_number, amount, method, confirmed_by, notes)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [req.params.id, receiptNumber, amount, req.body.method, req.user!.id, req.body.notes ?? null])

    const newPaid    = parseFloat(invoice.paid_amount) + amount
    const newBalance = Math.max(0, parseFloat(invoice.total_amount) - newPaid)
    const newStatus  = newBalance <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

    await queryOne(`
      UPDATE fee_invoices SET paid_amount=$1, balance_due=$2, status=$3 WHERE id=$4
    `, [newPaid, newBalance, newStatus, req.params.id])

    res.json({ success: true, data: payment })
  }
)
