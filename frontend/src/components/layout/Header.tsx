import { Bell, LogOut, Globe, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLang()

  return (
    <header className="bg-qasmia-navy text-white h-14 flex items-center px-4 gap-3 sticky top-0 z-30 shadow-md">
      {/* Hamburger (mobile) */}
      <button onClick={onMenuClick} className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition">
        <Menu size={22} />
      </button>

      {/* Logo + title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img src="/logo.png" alt="Qasmia" className="h-8 w-8 rounded-lg object-contain bg-white p-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight truncate">Qasmia</p>
          {title && <p className="text-[10px] text-blue-200 leading-tight truncate">{title}</p>}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition"
          title={t('Switch to Urdu', 'Switch to English')}
        >
          <Globe size={15} />
          <span className="font-semibold">{lang === 'en' ? 'اردو' : 'EN'}</span>
        </button>

        {/* Notifications placeholder */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-qasmia-pink rounded-full" />
        </button>

        {/* User info + logout */}
        <div className="flex items-center gap-2 ml-1">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold leading-tight">{user?.fullName}</p>
            <p className="text-[10px] text-blue-200 leading-tight capitalize">{user?.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-white/10 transition text-red-300 hover:text-red-200"
            title={t('Logout', 'لاگ آوٹ')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
