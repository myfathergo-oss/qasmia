import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR]', err.message, err.stack?.split('\n')[1])
  const status = err.status ?? err.statusCode ?? 500
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message ?? 'Internal server error',
  })
}
