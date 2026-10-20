import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import AppLayout     from './components/layout/AppLayout'
import StudentLayout from './components/layout/StudentLayout'

// Staff pages
import LoginPage        from './pages/auth/LoginPage'
import ChangePassword   from './pages/auth/ChangePassword'
import AdminDashboard   from './pages/admin/AdminDashboard'
import UstadDashboard   from './pages/ustad/UstadDashboard'
import StudentsPage     from './pages/admin/StudentsPage'
import ClassesPage      from './pages/admin/ClassesPage'
import AttendancePage   from './pages/ustad/AttendancePage'
import ProgressPage     from './pages/ustad/ProgressPage'
import ExamsPage        from './pages/admin/ExamsPage'
import FeesPage         from './pages/admin/FeesPage'
import NewsPage         from './pages/admin/NewsPage'
import ReportsPage      from './pages/admin/ReportsPage'
import TimetablePage    from './pages/admin/TimetablePage'
import SettingsPage     from './pages/admin/SettingsPage'
import MorePage         from './pages/ustad/MorePage'

// Student pages
import StudentDashboard  from './pages/student/StudentDashboard'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentProgress   from './pages/student/StudentProgress'
import StudentFees       from './pages/student/StudentFees'
import StudentProfile    from './pages/student/StudentProfile'

import NotFound from './pages/NotFound'

// ── Loading screen ─────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-qasmia-bg flex items-center justify-center">
      <div className="text-center">
        <img src="/logo.png" alt="Qasmia"
          className="h-16 w-16 mx-auto mb-4 rounded-2xl shadow-card animate-pulse" />
        <p className="text-qasmia-navy font-semibold text-sm">Loading Qasmia…</p>
      </div>
    </div>
  )
}

// ── Smart root redirect ────────────────────────────────────────
function RootRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'student') return <Navigate to="/student" replace />
  return <Navigate to="/dashboard" replace />
}

// ── Staff protected route ──────────────────────────────────────
function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'student') return <Navigate to="/student" replace />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  return <>{children}</>
}

// ── Student protected route ────────────────────────────────────
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'student') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ── Dashboard selector by role ─────────────────────────────────
function DashboardSelector() {
  const { user } = useAuth()
  if (user?.role === 'ustad') return <UstadDashboard />
  return <AdminDashboard />
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ─────────────────────────────────────── */}
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* ── Student Portal ──────────────────────────────── */}
            <Route
              element={
                <StudentRoute>
                  <StudentLayout />
                </StudentRoute>
              }
            >
              <Route path="/student"             element={<StudentDashboard />} />
              <Route path="/student/attendance"  element={<StudentAttendance />} />
              <Route path="/student/progress"    element={<StudentProgress />} />
              <Route path="/student/fees"        element={<StudentFees />} />
              <Route path="/student/profile"     element={<StudentProfile />} />
            </Route>

            {/* ── Staff Portal ────────────────────────────────── */}
            <Route
              element={
                <StaffRoute>
                  <AppLayout />
                </StaffRoute>
              }
            >
              <Route path="/dashboard"   element={<DashboardSelector />} />
              <Route path="/students/*"  element={<StudentsPage />} />
              <Route path="/classes/*"   element={<ClassesPage />} />
              <Route path="/attendance"  element={<AttendancePage />} />
              <Route path="/progress"    element={<ProgressPage />} />
              <Route path="/exams/*"     element={<ExamsPage />} />
              <Route path="/fees/*"      element={<FeesPage />} />
              <Route path="/news/*"      element={<NewsPage />} />
              <Route path="/reports"     element={<ReportsPage />} />
              <Route path="/timetable"   element={<TimetablePage />} />
              <Route path="/settings"    element={<SettingsPage />} />
              <Route path="/more"        element={<MorePage />} />
            </Route>

            {/* ── Root redirect ───────────────────────────────── */}
            <Route path="/"  element={<RootRedirect />} />
            <Route path="*"  element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}
