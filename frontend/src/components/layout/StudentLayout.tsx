import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Home, ClipboardCheck, BookOpen, DollarSign, User, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

const tabs = [
  { to: '/student',          icon: <Home size={20} />,         en: 'Home',     ur: 'ہوم',     end: true },
  { to: '/student/attendance',icon: <ClipboardCheck size={20}/>,en: 'Attend.', ur: 'حاضری',  end: false },
  { to: '/student/progress', icon: <BookOpen size={20} />,     en: 'Progress', ur: 'پیشرفت', end: false },
  { to: '/student/fees',     icon: <DollarSign size={20} />,   en: 'Fees',     ur: 'فیس',    end: false },
  { to: '/student/profile',  icon: <User size={20} />,         en: 'Profile',  ur: 'پروفائل',end: false },
]

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useLang()

  return (
    <div className="min-h-screen bg-qasmia-bg flex flex-col">
      {/* Simple top bar */}
      <header className="bg-qasmia-navy text-white h-14 flex items-center px-4 gap-3 sticky top-0 z-30 shadow-md">
        <img src="/logo.png" alt="Qasmia" className="h-8 w-8 rounded-lg object-contain bg-white p-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate">Qasmia</p>
          <p className="text-[10px] text-blue-200 leading-tight">{t('Student Portal', 'طالب علم پورٹل')}</p>
        </div>

        {/* User name */}
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold leading-tight">{user?.fullName}</p>
          <p className="text-[10px] text-blue-200 font-mono leading-tight">{user?.username}</p>
        </div>

        {/* Lang toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition"
        >
          <Globe size={14} />
          <span className="font-semibold">{lang === 'en' ? 'اردو' : 'EN'}</span>
        </button>

        {/* Logout */}
        <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 transition text-red-300">
          <LogOut size={18} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 shadow-[0_-2px_12px_rgba(38,52,111,0.08)]">
        <div className="flex">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold transition-colors
                 ${isActive ? 'text-qasmia-pink' : 'text-gray-400 hover:text-qasmia-navy'}`
              }
            >
              {tab.icon}
              <span className="mt-0.5">{t(tab.en, tab.ur)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
