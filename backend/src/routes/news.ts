import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { query, queryOne } from '../db/index'
import { authenticate, isAdmin, isAdminOrUstad, AuthRequest } from '../middleware/auth'

export const newsRouter = Router()
newsRouter.use(authenticate)

newsRouter.get('/', isAdminOrUstad, async (req: AuthRequest, res: Response) => {
  const { category, isPublic } = req.query as Record<string,string>
  let sql = `SELECT n.*, u.full_name AS created_by_name FROM news_posts n JOIN users u ON u.id = n.created_by WHERE 1=1`
  const params: any[] = []
  let i = 1
  if (category)  { sql += ` AND n.category = $${i++}`; params.push(category) }
  // Non-admins only see public posts
  if (req.user!.role === 'ustad') { sql += ` AND n.is_public = TRUE` }
  else if (isPublic) { sql += ` AND n.is_public = $${i++}`; params.push(isPublic === 'true') }
  sql += ' ORDER BY n.is_pinned DESC, n.published_at DESC NULLS LAST'
  res.json({ success: true, data: { items: await query(sql, params) } })
})

newsRouter.post('/', isAdmin,
  body('title').trim().notEmpty(),
  body('body').trim().notEmpty(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
    const b = req.body
    const row = await queryOne<any>(`
      INSERT INTO news_posts (title, title_urdu, body, body_urdu, category, is_public, is_pinned, image_url, published_at, scheduled_at, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
    `, [b.title, b.titleUrdu ?? null, b.body, b.bodyUrdu ?? null, b.category ?? 'general',
        b.isPublic ?? true, b.isPinned ?? false, b.imageUrl ?? null,
        b.publishedAt ?? new Date().toISOString(), b.scheduledAt ?? null, req.user!.id])
    res.status(201).json({ success: true, data: row })
  }
)
