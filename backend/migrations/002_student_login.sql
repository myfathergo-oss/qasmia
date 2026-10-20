-- ============================================================
-- Migration 002 – Student Login Support
-- Add student_ref_id to users table
-- ============================================================

-- Add column to link user account → student record
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS student_ref_id UUID REFERENCES students(id) ON DELETE SET NULL;

-- Add index for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_student_ref ON users(student_ref_id);

-- Add 'student' to role enum (if not already there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'user_role'::regtype
      AND enumlabel = 'student'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'student';
  END IF;
END$$;
