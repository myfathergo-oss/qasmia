import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, ClipboardCheck, BookOpen, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { AdminDashboardStats } from '../../types'
import api from '../../utils/api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const [stats, setStats]   = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin-stats')
      .then(r => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: { en: 'Total Students',     ur: 'کل طلباء' },        value: stats.totalStudents,            sub: t('Active enrollments','فعال داخلے'),                        icon: <Users size={22}/>,         color: 'bg-qasmia-navy text-white',   to: '/students' },
    { label: { en: 'Classes',            ur: 'کلاسز' },            value: stats.totalClasses,             sub: `${stats.totalUstads} ${t('Ustads','اساتذہ')}`,               icon: <GraduationCap size={22}/>,  color: 'bg-qasmia-navylt text-white', to: '/classes' },
    { label: { en: "Today's Attendance", ur: 'آج کی حاضری' },     value: `${stats.todayAttendancePercent}%`, sub: `${stats.todayPresentCount} ${t('present','حاضر')}`,      icon: <ClipboardCheck size={22}/>, color: stats.todayAttendancePercent >= 75 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white', to: '/attendance' },
    { label: { en: 'Progress Entries',   ur: 'پیشرفت اندراج' },   value: stats.recentProgressEntries,    sub: t('Last 24 hours','پچھلے 24 گھنٹے'),                          icon: <BookOpen size={22}/>,        color: 'bg-qasmia-pink text-white',   to: '/progress' },
    { label: { en: 'Upcoming Exams',     ur: 'آنے والے امتحانات'},  value: stats.upcomingExams,            sub: t('Next 7 days','اگلے 7 دن'),                                 icon: <FileText size={22}/>,        color: 'bg-purple-500 text-white',    to: '/exams' },
    { label: { en: 'Overdue Fees',       ur: 'بقایا فیس' },        value: stats.overdueFeesCount,         sub: t('Students pending','طلباء زیر التواء'),                     icon: <DollarSign size={22}/>,      color: stats.overdueFeesCount > 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white', to: '/fees' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-qasmia-navy to-qasmia-navylt rounded-2xl p-5 text-white shadow-card">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-12 w-12 rounded-xl bg-white p-1 object-contain" />
          <div>
            <p className="text-sm text-blue-200">{t('Welcome back,', 'خوش آمدید،')}</p>
            <h1 className="text-xl font-bold">{user?.fullName}</h1>
            <p className="text-xs text-blue-200 capitalize mt-0.5">
              {user?.role.replace('_', ' ')} · Madrasa Qasmia
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div>
        <h2 className="section-label mb-3">{t('Overview', 'جائزہ')}</h2>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse h-28 bg-gray-50" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {kpis.map(kpi => (
              <Link key={kpi.label.en} to={kpi.to}>
                <div className="card hover:shadow-card-hover transition-shadow cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                  <p className="text-2xl font-bold text-qasmia-navy">{kpi.value}</p>
                  <p className="text-xs font-semibold text-qasmia-text mt-0.5">{t(kpi.label.en, kpi.label.ur)}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8 text-gray-400">
            <p className="text-sm">{t('Could not load stats. Is the backend running?', 'اعداد و شمار لوڈ نہیں ہوئے۔ بیک اینڈ چیک کریں۔')}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-label">{t('Quick Actions', 'فوری اقدامات')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/students/new" icon={<Users size={18}/>}          label={t('Admit Student',    'طالب علم داخل کریں')} />
          <QuickAction to="/attendance"   icon={<ClipboardCheck size={18}/>} label={t('Mark Attendance',  'حاضری لگائیں')} />
          <QuickAction to="/progress"     icon={<BookOpen size={18}/>}       label={t('Add Progress',     'پیشرفت شامل کریں')} />
          <QuickAction to="/news/new"     icon={<TrendingUp size={18}/>}     label={t('Post News',        'خبر شائع کریں')} />
          <QuickAction to="/exams/new"    icon={<FileText size={18}/>}       label={t('Create Exam',      'امتحان بنائیں')} />
          <QuickAction to="/fees"         icon={<AlertCircle size={18}/>}    label={t('Collect Fees',     'فیس وصول کریں')} />
        </div>
      </div>

      {/* Attendance bar */}
      {stats && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-qasmia-navy text-sm">{t("Today's Attendance", 'آج کی حاضری')}</p>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-qasmia-navy to-qasmia-pink transition-all duration-700"
              style={{ width: `${stats.todayAttendancePercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{stats.todayPresentCount} {t('present', 'حاضر')}</span>
            <span className="font-semibold text-qasmia-navy">{stats.todayAttendancePercent}%</span>
            <span>{stats.totalStudents - stats.todayPresentCount} {t('absent/not marked', 'غیر حاضر')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow cursor-pointer group">
      <div className="w-9 h-9 rounded-xl bg-qasmia-bg flex items-center justify-center text-qasmia-navy group-hover:bg-qasmia-navy group-hover:text-white transition-colors flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm font-medium text-qasmia-text">{label}</span>
    </Link>
  )
}
