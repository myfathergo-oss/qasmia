import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { queryOne } from '../db/index'

export interface AuthUser {
  id: string
  username: string
  fullName: string
  role: string
  assignedClasses: string[]
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }
    queryOne<any>(`
      SELECT u.id, u.username, u.full_name, u.role,
             COALESCE(array_agg(ta.class_id) FILTER (WHERE ta.class_id IS NOT NULL), '{}') AS assigned_classes
      FROM users u
      LEFT JOIN teacher_assignments ta ON ta.ustad_id = u.id
      WHERE u.id = $1 AND u.is_active = TRUE
      GROUP BY u.id
    `, [payload.sub]).then(user => {
      if (!user) return res.status(401).json({ success: false, message: 'User not found' })
      req.user = {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        assignedClasses: user.assigned_classes,
      }
      next()
    }).catch(() => res.status(500).json({ success: false, message: 'Auth error' }))
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' })
    }
    next()
  }
}

export const isAdmin = requireRole('super_admin', 'admin')
export const isAdminOrUstad = requireRole('super_admin', 'admin', 'ustad', 'accounts_clerk')
