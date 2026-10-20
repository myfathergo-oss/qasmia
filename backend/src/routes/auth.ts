import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { query, queryOne } from '../db/index'
import { authenticate, AuthRequest } from '../middleware/auth'

export const authRouter = Router()

// POST /api/auth/login
authRouter.post('/login',
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const { username, password } = req.body
    const user = await queryOne<any>(
      `SELECT id, username, full_name, full_name_urdu, role, email, phone, password_hash,
              must_change_password, lang, is_active, student_ref_id
       FROM users WHERE username = $1`,
      [username]
    )

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' })
    }
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' })
    }

    // Get assigned classes for ustads
    const assignments = await query<{ class_id: string }>(
      `SELECT class_id FROM teacher_assignments WHERE ustad_id = $1`, [user.id]
    )

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    })

    res.json({
      success: true,
      data: {
        token,
        user: {
          id:                user.id,
          username:          user.username,
          fullName:          user.full_name,
          fullNameUrdu:      user.full_name_urdu,
          role:              user.role,
          email:             user.email,
          phone:             user.phone,
          mustChangePassword:user.must_change_password,
          lang:              user.lang,
          assignedClasses:   assignments.map((a: any) => a.class_id),
          studentRefId:      user.student_ref_id ?? null,
        },
      },
    })
  }
)

// POST /api/auth/change-password
authRouter.post('/change-password',
  authenticate,
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

    const hash = await bcrypt.hash(req.body.newPassword, 12)
    await query(
      `UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() WHERE id = $2`,
      [hash, req.user!.id]
    )
    res.json({ success: true, message: 'Password changed successfully' })
  }
)

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await queryOne<any>(
    `SELECT id, username, full_name, full_name_urdu, role, email, phone, must_change_password, lang
     FROM users WHERE id = $1`, [req.user!.id]
  )
  res.json({ success: true, data: user })
})
