/**
 * SQLite database layer – drop-in for local development
 * When PostgreSQL is available, switch DATABASE_URL to postgres://...
 * and use pool.ts instead.
 */
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(__dirname, '..', '..', 'qasmia.db')
let _db: Database.Database

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username             TEXT UNIQUE NOT NULL,
      password_hash        TEXT NOT NULL,
      full_name            TEXT NOT NULL,
      full_name_urdu       TEXT,
      role                 TEXT NOT NULL DEFAULT 'ustad',
      email                TEXT UNIQUE,
      phone                TEXT,
      must_change_password INTEGER NOT NULL DEFAULT 1,
      lang                 TEXT NOT NULL DEFAULT 'en',
      is_active            INTEGER NOT NULL DEFAULT 1,
      student_ref_id       TEXT,
      created_at           TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name              TEXT NOT NULL,
      name_urdu         TEXT,
      type              TEXT NOT NULL DEFAULT 'general',
      assigned_ustad_id TEXT,
      academic_year     TEXT,
      is_active         INTEGER NOT NULL DEFAULT 1,
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teacher_assignments (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      ustad_id    TEXT NOT NULL,
      class_id    TEXT NOT NULL,
      assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(ustad_id, class_id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      student_id        TEXT UNIQUE NOT NULL,
      full_name         TEXT NOT NULL,
      full_name_urdu    TEXT,
      date_of_birth     TEXT,
      gender            TEXT NOT NULL DEFAULT 'male',
      class_id          TEXT,
      enrollment_date   TEXT NOT NULL DEFAULT (date('now')),
      enrollment_status TEXT NOT NULL DEFAULT 'active',
      guardian_name     TEXT NOT NULL,
      guardian_phone    TEXT,
      guardian_relation TEXT,
      address           TEXT,
      notes             TEXT,
      created_by        TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      student_id    TEXT NOT NULL,
      class_id      TEXT NOT NULL,
      date          TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'not_marked',
      note          TEXT,
      marked_by     TEXT NOT NULL,
      corrected_by  TEXT,
      corrected_at  TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, class_id, date)
    );

    CREATE TABLE IF NOT EXISTS daily_quran_progress (
      id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      student_id          TEXT NOT NULL,
      class_id            TEXT NOT NULL,
      ustad_id            TEXT NOT NULL,
      date                TEXT NOT NULL,
      attendance_status   TEXT NOT NULL DEFAULT 'present',
      sabaq_surah         TEXT,
      sabaq_para          TEXT,
      sabaq_verse_start   INTEGER,
      sabaq_verse_end     INTEGER,
      sabaq_page_start    INTEGER,
      sabaq_page_end      INTEGER,
      sabaq_assessment    TEXT,
      sabqi_portion       TEXT,
      sabqi_completed     INTEGER DEFAULT 0,
      sabqi_assessment    TEXT,
      manzil_portion      TEXT,
      manzil_completed    INTEGER DEFAULT 0,
      manzil_assessment   TEXT,
      mistakes            INTEGER DEFAULT 0,
      fluency             TEXT,
      tajweed             TEXT,
      ustad_notes         TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, class_id, date)
    );

    CREATE TABLE IF NOT EXISTS exams (
      id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title         TEXT NOT NULL,
      category      TEXT NOT NULL DEFAULT 'monthly',
      class_id      TEXT NOT NULL,
      date          TEXT NOT NULL,
      total_marks   INTEGER NOT NULL DEFAULT 100,
      passing_marks INTEGER NOT NULL DEFAULT 40,
      syllabus      TEXT,
      published     INTEGER NOT NULL DEFAULT 0,
      created_by    TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exam_results (
      id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      exam_id        TEXT NOT NULL,
      student_id     TEXT NOT NULL,
      marks_obtained REAL NOT NULL,
      grade          TEXT,
      remarks        TEXT,
      entered_by     TEXT NOT NULL,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(exam_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS fee_invoices (
      id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      invoice_number TEXT UNIQUE NOT NULL,
      student_id     TEXT NOT NULL,
      month          TEXT,
      total_amount   REAL NOT NULL DEFAULT 0,
      paid_amount    REAL NOT NULL DEFAULT 0,
      balance_due    REAL NOT NULL DEFAULT 0,
      status         TEXT NOT NULL DEFAULT 'pending',
      due_date       TEXT,
      created_by     TEXT NOT NULL,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fee_items (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      invoice_id  TEXT NOT NULL,
      description TEXT NOT NULL,
      amount      REAL NOT NULL,
      type        TEXT NOT NULL DEFAULT 'monthly_fee'
    );

    CREATE TABLE IF NOT EXISTS payments (
      id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      invoice_id     TEXT NOT NULL,
      receipt_number TEXT UNIQUE NOT NULL,
      amount         REAL NOT NULL,
      method         TEXT NOT NULL DEFAULT 'cash',
      paid_at        TEXT NOT NULL DEFAULT (datetime('now')),
      confirmed_by   TEXT NOT NULL,
      notes          TEXT
    );

    CREATE TABLE IF NOT EXISTS news_posts (
      id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title        TEXT NOT NULL,
      title_urdu   TEXT,
      body         TEXT NOT NULL,
      body_urdu    TEXT,
      category     TEXT NOT NULL DEFAULT 'general',
      is_public    INTEGER NOT NULL DEFAULT 1,
      is_pinned    INTEGER NOT NULL DEFAULT 0,
      image_url    TEXT,
      published_at TEXT,
      scheduled_at TEXT,
      created_by   TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES
      ('madrasa_name', 'Madrasa Qasmia'),
      ('academic_year', '2026-2027'),
      ('student_seq', '0'),
      ('invoice_seq', '0'),
      ('receipt_seq', '0'),
      ('first_run_complete', 'false');

    -- Seed default classes
    INSERT OR IGNORE INTO classes (id, name, name_urdu, type) VALUES
      ('c1', 'Hifz Class A',  'حفظ کلاس اے',   'hifz'),
      ('c2', 'Nazra Class B', 'ناظرہ کلاس بی',  'nazra'),
      ('c3', 'Qaida Class',   'قاعدہ کلاس',     'qaida'),
      ('c4', 'Tajweed Class', 'تجوید کلاس',     'tajweed');
  `)
}

// ── Helpers (mimic pg pool interface) ─────────────────────────
export function sqliteQuery<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb()
  // Convert $1,$2... to ?,?,... for SQLite
  const sqliteSql = sql.replace(/\$\d+/g, '?')
  try {
    const stmt = db.prepare(sqliteSql)
    if (sqliteSql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params) as T[]
    } else {
      stmt.run(...params)
      return []
    }
  } catch (e: any) {
    throw new Error(`SQLite error: ${e.message}\nSQL: ${sqliteSql}`)
  }
}

export function sqliteQueryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = sqliteQuery<T>(sql, params)
  return rows[0] ?? null
}

// Sequence helper (replaces PostgreSQL sequences)
export function nextSeq(name: string): string {
  const db = getDb()
  const current = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(name) as { value: string } | undefined
  const next = parseInt(current?.value ?? '0') + 1
  db.prepare(`UPDATE settings SET value = ? WHERE key = ?`).run(String(next), name)
  return String(next)
}
