import { Link } from 'react-router-dom'
import {
  ClipboardList, BookOpen, FileText, Users,
  DollarSign, Newspaper, BarChart2, Clock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

const tiles = [
  { to: '/attendance', icon: <ClipboardList size={28}/>, en: 'Attendance',     ur: 'حاضری',       sub: { en: 'Mark today', ur: 'آج لگائیں' },    color: 'from-qasmia-navy to-qasmia-navylt' },
  { to: '/progress',   icon: <BookOpen size={28}/>,      en: 'Quran Progress', ur: 'قرآن پیشرفت', sub: { en: 'Sabaq / Sabqi', ur: 'سبق / سبقی' }, color: 'from-qasmia-pink to-pink-400' },
  { to: '/exams',      icon: <FileText size={28}/>,      en: 'Exams',          ur: 'امتحانات',     sub: { en: 'Marks / results', ur: 'نمبر' },      color: 'from-purple-600 to-purple-400' },
  { to: '/students',   icon: <Users size={28}/>,         en: 'Students',       ur: 'طلباء',        sub: { en: 'Profiles', ur: 'پروفائل' },          color: 'from-blue-600 to-blue-400' },
  { to: '/fees',       icon: <DollarSign size={28}/>,    en: 'Fees',           ur: 'فیس',          sub: { en: 'Dues / receipts', ur: 'رسید' },       color: 'from-green-600 to-green-400' },
  { to: '/news',       icon: <Newspaper size={28}/>,     en: 'News',           ur: 'خبریں',        sub: { en: 'Announcements', ur: 'اعلانات' },      color: 'from-yellow-500 to-yellow-400' },
  { to: '/reports',    icon: <BarChart2 size={28}/>,     en: 'Reports',        ur: 'رپورٹس',       sub: { en: 'Print / share', ur: 'پرنٹ' },         color: 'from-teal-600 to-teal-400' },
  { to: '/timetable',  icon: <Clock size={28}/>,         en: 'Timetable',      ur: 'وقت نامہ',     sub: { en: 'Classes', ur: 'کلاسز' },              color: 'from-orange-500 to-orange-400' },
]

export default function UstadDashboard() {
  const { user } = useAuth()
  const { t } = useLang()

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-qasmia-navy to-qasmia-navylt rounded-2xl p-5 text-white">
        <p className="text-blue-200 text-sm">{t('Welcome back', 'خوش آمدید')}</p>
        <h1 className="text-xl font-bold mt-0.5">{user?.fullName}</h1>
        <p className="text-blue-200 text-xs mt-1">
          {t('Ustad', 'استاد')} · {user?.assignedClasses?.length
            ? `${user.assignedClasses.length} ${t('class(es) assigned', 'کلاس')}`
            : t('Hifz Class A', 'حفظ کلاس اے')}
        </p>
        <p className="text-blue-200/70 text-[11px] mt-2">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Tiles grid */}
      <div>
        <p className="section-label">{t('Modules', 'ماڈیولز')}</p>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <Link key={tile.to} to={tile.to}>
              <div className={`bg-gradient-to-br ${tile.color} rounded-2xl p-4 text-white shadow-card hover:shadow-card-hover transition-shadow active:scale-95 cursor-pointer`}>
                <div className="mb-3">{tile.icon}</div>
                <p className="font-bold text-sm leading-tight">{t(tile.en, tile.ur)}</p>
                <p className="text-white/70 text-[11px] mt-0.5">{t(tile.sub.en, tile.sub.ur)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today reminder */}
      <div className="card border-l-4 border-qasmia-pink">
        <p className="text-sm font-semibold text-qasmia-navy">{t("Today's Checklist", 'آج کا چیک لسٹ')}</p>
        <ul className="mt-2 space-y-1.5">
          {[
            { en: 'Mark attendance for your class', ur: 'کلاس کی حاضری لگائیں' },
            { en: 'Record daily Quran progress', ur: 'روزانہ قرآن پیشرفت درج کریں' },
            { en: 'Check any pending remarks', ur: 'زیر التواء ریمارکس دیکھیں' },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
              {t(item.en, item.ur)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
