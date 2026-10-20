import bcrypt from 'bcrypt'
import { query, queryOne } from '../db/index'

export async function checkFirstRun() {
  const setting = await queryOne<{ value: string }>(
    `SELECT value FROM settings WHERE key = 'first_run_complete'`
  )
  if (setting?.value === 'true') return

  const adminUsername = process.env.SETUP_ADMIN_USERNAME ?? 'ustad0001'
  const tempPassword  = process.env.SETUP_ADMIN_TEMP_PASSWORD
  if (!tempPassword) {
    console.warn('⚠️  SETUP_ADMIN_TEMP_PASSWORD not set – skipping first-run admin creation')
    return
  }

  const existing = await queryOne(`SELECT id FROM users WHERE username = ?`, [adminUsername])
  if (existing) {
    await query(`UPDATE settings SET value = 'true' WHERE key = 'first_run_complete'`, [])
    return
  }

  const hash = await bcrypt.hash(tempPassword, 12)
  await query(`
    INSERT INTO users (id, username, password_hash, full_name, role, must_change_password)
    VALUES (lower(hex(randomblob(16))), ?, ?, 'Super Administrator', 'super_admin', 1)
  `, [adminUsername, hash])

  await query(`UPDATE settings SET value = 'true' WHERE key = 'first_run_complete'`, [])
  console.log(`✅  First admin created: ${adminUsername}`)
  console.log(`    Login with password: ${tempPassword}`)
  console.log(`    (You will be asked to change it on first login)`)
}
