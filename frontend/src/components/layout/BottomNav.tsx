import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, ClipboardList, MoreHorizontal } from 'lucide-react'
import { useLang } from '../../context/LangContext'

const tabs = [
  { to: '/dashboard',  icon: <LayoutDashboard size={20} />, en: 'Home',     ur: 'ہوم' },
  { to: '/attendance', icon: <ClipboardList size={20} />,   en: 'Attend.',   ur: 'حاضری' },
  { to: '/progress',   icon: <BookOpen size={20} />,        en: 'Progress',  ur: 'پیشرفت' },
  { to: '/students',   icon: <Users size={20} />,           en: 'Students',  ur: 'طلباء' },
  { to: '/more',       icon: <MoreHorizontal size={20} />,  en: 'More',      ur: 'مزید' },
]

export default function BottomNav() {
  const { t } = useLang()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 lg:hidden safe-bottom shadow-[0_-2px_12px_rgba(38,52,111,0.08)]">
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
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
  )
}
