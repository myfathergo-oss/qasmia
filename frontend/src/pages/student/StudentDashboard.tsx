import { useEffect, useState } from 'react'
import { BookOpen, ClipboardCheck, DollarSign, User, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import api from '../../utils/api'

interface StudentStats {
  totalPresentDays: number
  totalAbsentDays: number
  attendancePercent: number
  lastSabaq: string
  lastSabaqDate: string
  totalMemoized: string
  feeStatus: string
  balanceDue: number
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/student/my-stats')
      .then(r => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-qasmia-navy to-qasmia-navylt rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-blue-200 text-xs">{t('Assalam-o-Alaikum', 'السلام علیکم')}</p>
            <h1 className="text-lg font-bold leading-tight">{user?.fullName}</h1>
            <p className="text-blue-200 text-xs mt-0.5 font-mono">{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-2">
              <ClipboardCheck size={18} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-qasmia-navy">{stats.attendancePercent}%</p>
            <p className="text-xs font-semibold text-qasmia-text">{t('Attendance', 'حاضری')}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {stats.totalPresentDays} {t('present', 'حاضر')} · {stats.totalAbsentDays} {t('absent', 'غیر حاضر')}
            </p>
          </div>

          <div className="card">
            <div className="w-9 h-9 rounded-xl bg-qasmia-navy/10 flex items-center justify-center mb-2">
              <BookOpen size={18} className="text-qasmia-navy" />
            </div>
            <p className="text-sm font-bold text-qasmia-navy leading-tight">{stats.lastSabaq || '—'}</p>
            <p className="text-xs font-semibold text-qasmia-text mt-1">{t('Last Sabaq', 'آخری سبق')}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stats.lastSabaqDate || '—'}</p>
          </div>

          <div className="card">
            <div className="w-9 h-9 rounded-xl bg-qasmia-pink/10 flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-qasmia-pink" />
            </div>
            <p className="text-sm font-bold text-qasmia-navy leading-tight">{stats.totalMemoized || '—'}</p>
            <p className="text-xs font-semibold text-qasmia-text mt-1">{t('Memorized', 'حفظ شدہ')}</p>
          </div>

          <div className="card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
              stats.balanceDue > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <DollarSign size={18} className={stats.balanceDue > 0 ? 'text-red-500' : 'text-green-600'} />
            </div>
            <p className={`text-lg font-bold ${stats.balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
              {stats.balanceDue > 0 ? `Rs ${stats.balanceDue}` : t('Paid ✓', 'ادا ✓')}
            </p>
            <p className="text-xs font-semibold text-qasmia-text mt-1">{t('Fee Status', 'فیس صورتحال')}</p>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-400 text-sm">
          {t('Could not load stats.', 'اعداد و شمار لوڈ نہیں ہوئے۔')}
        </div>
      )}

      {/* Navigation tiles */}
      <div>
        <p className="section-label">{t('My Records', 'میرے ریکارڈ')}</p>
        <div className="grid grid-cols-1 gap-3">
          <NavTile
            to="attendance"
            icon={<ClipboardCheck size={22} />}
            color="bg-green-500"
            title={t('My Attendance', 'میری حاضری')}
            sub={t('View daily attendance history', 'روزانہ حاضری کی تاریخ')}
          />
          <NavTile
            to="progress"
            icon={<BookOpen size={22} />}
            color="bg-qasmia-navy"
            title={t('My Quran Progress', 'میری قرآن پیشرفت')}
            sub={t('Sabaq, Sabqi, Manzil history', 'سبق، سبقی، منزل کی تاریخ')}
          />
          <NavTile
            to="fees"
            icon={<DollarSign size={22} />}
            color="bg-qasmia-pink"
            title={t('My Fees', 'میری فیس')}
            sub={t('Fee invoices and payment receipts', 'فیس انوائس اور رسیدیں')}
          />
          <NavTile
            to="profile"
            icon={<User size={22} />}
            color="bg-purple-500"
            title={t('My Profile', 'میرا پروفائل')}
            sub={t('Personal and guardian details', 'ذاتی اور سرپرست کی معلومات')}
          />
        </div>
      </div>
    </div>
  )
}

function NavTile({ to, icon, color, title, sub }: {
  to: string; icon: React.ReactNode; color: string; title: string; sub: string
}) {
  return (
    <a href={`/student/${to}`}
      className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow cursor-pointer">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-qasmia-text text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </a>
  )
}
