import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  FileText, DollarSign, Newspaper, BarChart2,
  Settings, Clock, X, GraduationCap
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  to: string
  icon: React.ReactNode
  en: string
  ur: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/dashboard',   icon: <LayoutDashboard size={18} />, en: 'Dashboard',      ur: 'ڈیش بورڈ' },
  { to: '/students',    icon: <Users size={18} />,            en: 'Students',       ur: 'طلباء' },
  { to: '/classes',     icon: <GraduationCap size={18} />,   en: 'Classes',        ur: 'کلاسز' },
  { to: '/attendance',  icon: <ClipboardList size={18} />,    en: 'Attendance',     ur: 'حاضری' },
  { to: '/progress',    icon: <BookOpen size={18} />,         en: 'Quran Progress', ur: 'قرآن پیشرفت' },
  { to: '/exams',       icon: <FileText size={18} />,         en: 'Exams',          ur: 'امتحانات' },
  { to: '/fees',        icon: <DollarSign size={18} />,       en: 'Fees',           ur: 'فیس' },
  { to: '/news',        icon: <Newspaper size={18} />,        en: 'News',           ur: 'خبریں' },
  { to: '/reports',     icon: <BarChart2 size={18} />,        en: 'Reports',        ur: 'رپورٹس' },
  { to: '/timetable',   icon: <Clock size={18} />,            en: 'Timetable',      ur: 'وقت نامہ' },
  { to: '/settings',    icon: <Settings size={18} />,         en: 'Settings',       ur: 'ترتیبات', adminOnly: true },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { isAdmin } = useAuth()
  const { t, isUrdu } = useLang()

  const items = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel
          Desktop: static, always visible (lg:relative lg:translate-x-0 lg:flex)
          Mobile:  fixed drawer, slides in/out                                  */}
      <aside
        className={`
          fixed top-14 bottom-0 w-64 bg-qasmia-navy z-50 flex flex-col
          transition-transform duration-300
          lg:static lg:top-0 lg:z-auto lg:translate-x-0 lg:flex
          ${isUrdu ? 'right-0' : 'left-0'}
          ${open
            ? 'translate-x-0'
            : isUrdu ? 'translate-x-full' : '-translate-x-full'
          }
        `}
      >
        {/* Sidebar header — only shown on mobile (desktop has app header) */}
        <div className="flex items-center justify-between h-12 px-4 border-b border-white/10 lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Qasmia" className="h-7 w-7 rounded-lg object-contain bg-white p-0.5" />
            <p className="text-white text-sm font-bold">Qasmia</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Logo shown on desktop (no app-level close button needed) */}
        <div className="hidden lg:flex items-center gap-2 h-14 px-4 border-b border-white/10 flex-shrink-0">
          <img src="/logo.png" alt="Qasmia" className="h-8 w-8 rounded-lg object-contain bg-white p-0.5" />
          <div>
            <p className="text-white text-sm font-bold leading-tight">Qasmia</p>
            <p className="text-blue-200 text-[10px] leading-tight">Quran & Education</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-qasmia-pink text-white shadow-sm'
                   : 'text-blue-100 hover:bg-white/10 hover:text-white'
                 }
                 ${isUrdu ? 'flex-row-reverse text-right' : ''}`
              }
            >
              {item.icon}
              <span>{t(item.en, item.ur)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <p className="text-[10px] text-blue-200/50 text-center">
            Qasmia v1.0 · Madrasa Qasmia
          </p>
        </div>
      </aside>
    </>
  )
}
