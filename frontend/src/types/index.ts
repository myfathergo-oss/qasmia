// ── User & Auth ────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'ustad' | 'accounts_clerk' | 'student'

export interface User {
  id: string
  username: string
  fullName: string
  fullNameUrdu?: string
  role: UserRole
  email?: string
  phone?: string
  assignedClasses?: string[]   // class IDs for ustads
  studentId?: string           // for student role - links to students table
  mustChangePassword: boolean
  lang: 'en' | 'ur'
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

// ── Student ────────────────────────────────────────────────────
export interface Student {
  id: string
  studentId: string          // e.g. QSM-001
  fullName: string
  fullNameUrdu?: string
  dateOfBirth?: string
  gender: 'male' | 'female'
  classId: string
  enrollmentDate: string
  enrollmentStatus: 'active' | 'graduated' | 'withdrawn'
  guardianName: string
  guardianPhone?: string
  guardianRelation?: string
  address?: string
  notes?: string
  createdAt: string
}

// ── Class ──────────────────────────────────────────────────────
export interface Class {
  id: string
  name: string
  nameUrdu?: string
  type: 'hifz' | 'nazra' | 'qaida' | 'tajweed' | 'islamiat' | 'general'
  assignedUstadId?: string
  assignedUstad?: User
  studentCount?: number
  createdAt: string
}

// ── Attendance ─────────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'approved_leave' | 'not_marked'

export interface AttendanceRecord {
  id: string
  studentId: string
  student?: Student
  classId: string
  date: string               // ISO date YYYY-MM-DD
  status: AttendanceStatus
  markedBy: string           // user id
  markedByName?: string
  correctedBy?: string
  correctedAt?: string
  note?: string
  createdAt: string
}

// ── Quran Progress ─────────────────────────────────────────────
export type QuranAssessment = 'excellent' | 'good' | 'needs_revision' | 'not_prepared'

export interface QuranProgress {
  id: string
  studentId: string
  student?: Student
  classId: string
  ustadId: string
  date: string
  attendanceStatus: AttendanceStatus
  // Sabaq (new lesson)
  sabaqSurah?: string
  sabaqPara?: string
  sabaqVerseStart?: number
  sabaqVerseEnd?: number
  sabaqPageStart?: number
  sabaqPageEnd?: number
  sabaqAssessment?: QuranAssessment
  // Sabqi (yesterday's revision)
  sabqiPortion?: string
  sabqiCompleted?: boolean
  sabqiAssessment?: QuranAssessment
  // Manzil (long-term revision)
  manzilPortion?: string
  manzilCompleted?: boolean
  manzilAssessment?: QuranAssessment
  // Overall
  mistakes?: number
  fluency?: QuranAssessment
  tajweed?: QuranAssessment
  ustadNotes?: string
  createdAt: string
}

// ── Exam ───────────────────────────────────────────────────────
export interface Exam {
  id: string
  title: string
  category: 'monthly' | 'term' | 'annual' | 'nazra' | 'hifz' | 'tajweed' | 'islamiat' | 'custom'
  classId: string
  class?: Class
  date: string
  totalMarks: number
  passingMarks: number
  syllabus?: string
  published: boolean
  createdBy: string
  createdAt: string
}

export interface ExamResult {
  id: string
  examId: string
  studentId: string
  student?: Student
  marksObtained: number
  grade?: string
  remarks?: string
  enteredBy: string
  createdAt: string
}

// ── Fees ──────────────────────────────────────────────────────
export interface FeeInvoice {
  id: string
  invoiceNumber: string
  studentId: string
  student?: Student
  month?: string             // e.g. "2026-10"
  items: FeeItem[]
  totalAmount: number
  paidAmount: number
  balanceDue: number
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  dueDate?: string
  createdAt: string
}

export interface FeeItem {
  id: string
  description: string
  amount: number
  type: 'monthly_fee' | 'admission' | 'exam_fee' | 'other' | 'concession'
}

export interface Payment {
  id: string
  invoiceId: string
  receiptNumber: string
  amount: number
  method: 'cash' | 'bank_transfer' | 'easypaisa' | 'jazzcash'
  paidAt: string
  confirmedBy: string
  confirmedByName?: string
  notes?: string
}

// ── News ───────────────────────────────────────────────────────
export interface NewsPost {
  id: string
  title: string
  titleUrdu?: string
  body: string
  bodyUrdu?: string
  category: 'general' | 'exam' | 'holiday' | 'admission' | 'ramadan' | 'competition' | 'internal'
  isPublic: boolean
  isPinned: boolean
  imageUrl?: string
  publishedAt?: string
  scheduledAt?: string
  createdBy: string
  createdAt: string
}

// ── Dashboard KPIs ─────────────────────────────────────────────
export interface AdminDashboardStats {
  totalStudents: number
  totalClasses: number
  todayPresentCount: number
  todayAttendancePercent: number
  recentProgressEntries: number
  upcomingExams: number
  overdueFeesCount: number
  totalUstads: number
}

// ── API Response ───────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
