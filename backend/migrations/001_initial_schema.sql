-- ============================================================
-- Qasmia Madrasa Management System – Initial Schema
-- PostgreSQL 14+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Roles & Users ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('super_admin','admin','ustad','accounts_clerk');
CREATE TYPE app_lang  AS ENUM ('en','ur');

CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username             VARCHAR(50)  UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  full_name            VARCHAR(120) NOT NULL,
  full_name_urdu       VARCHAR(120),
  role                 user_role    NOT NULL DEFAULT 'ustad',
  email                VARCHAR(120) UNIQUE,
  phone                VARCHAR(20),
  must_change_password BOOLEAN      NOT NULL DEFAULT TRUE,
  lang                 app_lang     NOT NULL DEFAULT 'en',
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);

-- ── Classes ───────────────────────────────────────────────────
CREATE TYPE class_type AS ENUM ('hifz','nazra','qaida','tajweed','islamiat','general');

CREATE TABLE classes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(100) NOT NULL,
  name_urdu        VARCHAR(100),
  type             class_type   NOT NULL DEFAULT 'general',
  assigned_ustad_id UUID REFERENCES users(id) ON DELETE SET NULL,
  academic_year    VARCHAR(20),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teacher assignments (many ustads can be assigned to a class)
CREATE TABLE teacher_assignments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ustad_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id   UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ustad_id, class_id)
);

-- ── Students ──────────────────────────────────────────────────
CREATE TYPE enrollment_status AS ENUM ('active','graduated','withdrawn');
CREATE TYPE gender_type AS ENUM ('male','female');

CREATE TABLE students (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        VARCHAR(20) UNIQUE NOT NULL,  -- e.g. QSM-001
  full_name         VARCHAR(120) NOT NULL,
  full_name_urdu    VARCHAR(120),
  date_of_birth     DATE,
  gender            gender_type NOT NULL DEFAULT 'male',
  class_id          UUID REFERENCES classes(id) ON DELETE SET NULL,
  enrollment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  enrollment_status enrollment_status NOT NULL DEFAULT 'active',
  guardian_name     VARCHAR(120) NOT NULL,
  guardian_phone    VARCHAR(20),
  guardian_relation VARCHAR(50),
  address           TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(enrollment_status);
CREATE INDEX idx_students_name_trgm ON students USING gin(full_name gin_trgm_ops);

-- Auto-generate student ID sequence
CREATE SEQUENCE student_seq START 1;

-- ── Attendance ────────────────────────────────────────────────
CREATE TYPE attendance_status AS ENUM ('present','absent','late','approved_leave','not_marked');

CREATE TABLE attendance (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  status        attendance_status NOT NULL DEFAULT 'not_marked',
  note          TEXT,
  marked_by     UUID NOT NULL REFERENCES users(id),
  corrected_by  UUID REFERENCES users(id),
  corrected_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, class_id, date)
);

CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date   ON attendance(class_id, date);

-- ── Daily Quran Progress ──────────────────────────────────────
CREATE TYPE quran_assessment AS ENUM ('excellent','good','needs_revision','not_prepared');

CREATE TABLE daily_quran_progress (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id            UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  ustad_id            UUID NOT NULL REFERENCES users(id),
  date                DATE NOT NULL,
  attendance_status   attendance_status NOT NULL DEFAULT 'present',
  -- Sabaq
  sabaq_surah         VARCHAR(100),
  sabaq_para          VARCHAR(20),
  sabaq_verse_start   INT,
  sabaq_verse_end     INT,
  sabaq_page_start    INT,
  sabaq_page_end      INT,
  sabaq_assessment    quran_assessment,
  -- Sabqi
  sabqi_portion       TEXT,
  sabqi_completed     BOOLEAN DEFAULT FALSE,
  sabqi_assessment    quran_assessment,
  -- Manzil
  manzil_portion      TEXT,
  manzil_completed    BOOLEAN DEFAULT FALSE,
  manzil_assessment   quran_assessment,
  -- Overall
  mistakes            INT DEFAULT 0,
  fluency             quran_assessment,
  tajweed             quran_assessment,
  ustad_notes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, class_id, date)
);

CREATE INDEX idx_progress_student_date ON daily_quran_progress(student_id, date);

-- ── Exams ─────────────────────────────────────────────────────
CREATE TYPE exam_category AS ENUM ('monthly','term','annual','nazra','hifz','tajweed','islamiat','custom');

CREATE TABLE exams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200) NOT NULL,
  category      exam_category NOT NULL DEFAULT 'monthly',
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  total_marks   INT NOT NULL DEFAULT 100,
  passing_marks INT NOT NULL DEFAULT 40,
  syllabus      TEXT,
  published     BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained  DECIMAL(6,2) NOT NULL,
  grade           VARCHAR(5),
  remarks         TEXT,
  entered_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, student_id)
);

-- ── Fees ──────────────────────────────────────────────────────
CREATE TYPE invoice_status AS ENUM ('pending','partial','paid','overdue');
CREATE TYPE fee_item_type  AS ENUM ('monthly_fee','admission','exam_fee','other','concession');
CREATE TYPE payment_method AS ENUM ('cash','bank_transfer','easypaisa','jazzcash');

CREATE SEQUENCE invoice_seq START 1;

CREATE TABLE fee_invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(30) UNIQUE NOT NULL,
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month          VARCHAR(7),          -- e.g. 2026-10
  total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_due    DECIMAL(10,2) NOT NULL DEFAULT 0,
  status         invoice_status NOT NULL DEFAULT 'pending',
  due_date       DATE,
  created_by     UUID NOT NULL REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fee_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id     UUID NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
  description    VARCHAR(200) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  type           fee_item_type NOT NULL DEFAULT 'monthly_fee'
);

CREATE SEQUENCE receipt_seq START 1;

CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id     UUID NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
  receipt_number VARCHAR(30) UNIQUE NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  method         payment_method NOT NULL DEFAULT 'cash',
  paid_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_by   UUID NOT NULL REFERENCES users(id),
  notes          TEXT
);

CREATE INDEX idx_invoices_student ON fee_invoices(student_id);
CREATE INDEX idx_invoices_status  ON fee_invoices(status);

-- ── News / Announcements ─────────────────────────────────────
CREATE TYPE news_category AS ENUM ('general','exam','holiday','admission','ramadan','competition','internal');

CREATE TABLE news_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(300) NOT NULL,
  title_urdu   VARCHAR(300),
  body         TEXT NOT NULL,
  body_urdu    TEXT,
  category     news_category NOT NULL DEFAULT 'general',
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  image_url    TEXT,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_by   UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_public_published ON news_posts(is_public, published_at DESC);

-- ── Timetable ─────────────────────────────────────────────────
CREATE TABLE timetables (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id   UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day        VARCHAR(10) NOT NULL,  -- Monday … Saturday
  time_start TIME NOT NULL,
  time_end   TIME NOT NULL,
  ustad_id   UUID REFERENCES users(id)
);

-- ── Documents ─────────────────────────────────────────────────
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  filename    VARCHAR(300) NOT NULL,
  file_url    TEXT NOT NULL,
  doc_type    VARCHAR(50),
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Audit Log ─────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  table_name  VARCHAR(100),
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user    ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_table   ON audit_logs(table_name, record_id);

-- ── Settings ──────────────────────────────────────────────────
CREATE TABLE settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('madrasa_name',      'Madrasa Qasmia'),
  ('academic_year',     '2026-2027'),
  ('default_fee',       '1500'),
  ('timezone',          'Asia/Karachi'),
  ('first_run_complete','false');
