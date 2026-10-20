/**
 * Unified DB layer
 * If DATABASE_URL starts with "postgresql://" → use pg Pool
 * Otherwise → use SQLite (local dev)
 */
import { sqliteQuery, sqliteQueryOne, nextSeq } from './sqlite'

const usePg = (process.env.DATABASE_URL ?? '').startsWith('postgresql://')

let pgQuery:    ((sql: string, params?: any[]) => Promise<any[]>) | null = null
let pgQueryOne: ((sql: string, params?: any[]) => Promise<any | null>) | null = null

if (usePg) {
  const pool = require('./pool')
  pgQuery    = pool.query
  pgQueryOne = pool.queryOne
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  if (usePg) return pgQuery!(sql, params)
  return sqliteQuery<T>(sql, params ?? [])
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  if (usePg) return pgQueryOne!(sql, params)
  return sqliteQueryOne<T>(sql, params ?? [])
}

export async function getNextSeq(name: string): Promise<string> {
  if (usePg) {
    const pgPool = require('./pool')
    const row = await pgPool.queryOne<{ nextval: string }>(`SELECT nextval('${name}')`)
    return row?.nextval ?? '1'
  }
  return nextSeq(name)
}
