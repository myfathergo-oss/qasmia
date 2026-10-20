# 🕌 Qasmia – Madrasa Management System

**Quran & Education** | Full-stack PWA for managing a madrasa

---

## 📋 Features

| Module | Description |
|--------|-------------|
| 🔐 Auth | Role-based login (Super Admin / Admin / Ustad / Accounts Clerk), force password change on first login |
| 👥 Students | Unique IDs (QSM-001…), guardian info, admission form, enrollment status |
| 🏫 Classes | Hifz / Nazra / Qaida / Tajweed / Islamiat, ustad assignment |
| ✅ Attendance | Per-student per-class daily marking, bulk save, correction log, monthly summary |
| 📖 Quran Progress | Sabaq / Sabqi / Manzil, per-student entry, assessment ratings, ustad notes |
| 📝 Exams | Create exams, enter marks, grade computation, publish results, PDF cards |
| 💰 Fees | Monthly invoices, payment confirmation, numbered receipts, overdue tracking |
| 📰 News | Bilingual posts (EN/UR), categories, pinning, public/internal, scheduled publish |
| 📊 Reports | Attendance register, progress card, exam results, fee collection (PDF) |
| 🌐 Bilingual | Full English + Urdu RTL interface, per-user language preference |
| 📱 PWA | Installable on Android/iOS, works in mobile browser |

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite + PWA
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL 16
- **Auth:** JWT (Argon2-level bcrypt hashing)
- **Deploy:** Docker Compose + Nginx

---

## 🚀 Quick Start (Docker)

### 1. Clone & configure

```bash
git clone <repo>
cd qasmia
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_64_char_random_secret
SETUP_ADMIN_TEMP_PASSWORD=TempPass!123   # forced change on first login
```

### 2. Build & run

```bash
docker compose up --build -d
```

### 3. Open app

- **Web:** http://localhost
- **API:** http://localhost:3001/api/health
- **First login:** username `ustad0001`, password from `SETUP_ADMIN_TEMP_PASSWORD`
- You will be forced to change the password before accessing the system.

---

## 💻 Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally

### Backend

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
# Create DB:
createdb qasmia_db
psql qasmia_db < migrations/001_initial_schema.sql
npm run dev                   # starts on :3001
```

### Frontend

```bash
cd frontend
npm install
# Copy logo to public folder:
copy ..\..\..\Qasmia_Logo.png public\logo.png
npm run dev                   # starts on :5173
```

---

## 🗄️ Database Schema

Key tables:

```
users              – admin / ustad accounts
classes            – Hifz, Nazra, Qaida, Tajweed, etc.
teacher_assignments – ustad ↔ class mapping
students           – all student records (QSM-001…)
attendance         – per-student per-class per-day
daily_quran_progress – Sabaq / Sabqi / Manzil entries
exams              – exam definitions
exam_results       – per-student marks & grades
fee_invoices       – monthly fee bills
fee_items          – line items per invoice
payments           – confirmed payments + receipt numbers
news_posts         – bilingual news & notices
timetables         – weekly class schedule
audit_logs         – change tracking
settings           – madrasa name, academic year, etc.
```

Full schema: `backend/migrations/001_initial_schema.sql`

---

## 🔒 Security

- Passwords hashed with **bcrypt** (cost 12)
- JWT tokens with configurable expiry
- Rate limiting on login endpoint (20 req/15 min)
- CSRF-safe (JWT in header, not cookie)
- Server-side role authorization on every endpoint
- Ustads can **only** access their assigned classes
- Audit log on marks, payments, and attendance changes
- Secrets loaded from environment – **never hardcoded**

---

## 📱 PWA Installation

1. Open http://localhost in Chrome/Safari on your phone
2. Tap **Add to Home Screen** / browser install prompt
3. App works like a native app with offline caching

---

## 📁 Project Structure

```
qasmia/
├── frontend/          # React + Tailwind PWA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/          LoginPage, ChangePassword
│   │   │   ├── admin/         Dashboard, Students, Classes, Exams, Fees, News, Reports, Settings
│   │   │   └── ustad/         Dashboard, Attendance, Progress, More
│   │   ├── components/layout/ Header, Sidebar, BottomNav, AppLayout
│   │   ├── context/           AuthContext, LangContext
│   │   ├── types/             TypeScript interfaces
│   │   └── utils/             api.ts, helpers.ts
│   └── public/        logo.png, manifest
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/    auth, students, classes, attendance, progress, exams, fees, news, reports, dashboard
│   │   ├── middleware/ auth, errorHandler, firstRun
│   │   └── db/        pool.ts
│   └── migrations/    001_initial_schema.sql
├── docker-compose.yml
└── README.md
```

---

## ✅ Acceptance Test Checklist

- [ ] Create a class, enroll 4 students, assign ustad
- [ ] Ustad logs in, marks different attendance per student
- [ ] Save distinct Quran progress entries per student
- [ ] Admin creates exam, ustad enters marks
- [ ] Admin publishes news post (bilingual)
- [ ] Admin issues fee invoice, confirms payment, views receipt
- [ ] Switch to Urdu – verify RTL layout
- [ ] Test on mobile screen (320px+)
- [ ] Verify ustad cannot access other class students

---

> **Privacy:** Student names, contacts, and learning records are never published publicly. Guardian reports are generated as single-child PDFs, accessible only through authorized staff actions.
