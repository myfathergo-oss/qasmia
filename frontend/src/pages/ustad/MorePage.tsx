import { Link } from 'react-router-dom'
import { FileText, DollarSign, Newspaper, BarChart2, Clock, Settings, LogOut } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'

const moreItems = [
  { to:'/exams',     icon:<FileText size={20}/>,  en:'Exams',     ur:'امتحانات' },
  { to:'/fees',      icon:<DollarSign size={20}/>, en:'Fees',      ur:'فیس' },
  { to:'/news',      icon:<Newspaper size={20}/>,  en:'News',      ur:'خبریں' },
  { to:'/reports',   icon:<BarChart2 size={20}/>,  en:'Reports',   ur:'رپورٹس' },
  { to:'/timetable', icon:<Clock size={20}/>,      en:'Timetable', ur:'وقت نامہ' },
  { to:'/settings',  icon:<Settings size={20}/>,   en:'Settings',  ur:'ترتیبات' },
]

export default function MorePage() {
  const { t } = useLang()
  const { logout, user } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="page-title">{t('More','مزید')}</h1>

      <div className="card flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-qasmia-navy flex items-center justify-center text-white font-bold text-lg">
          {user?.fullName?.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-qasmia-navy">{user?.fullName}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role.replace('_',' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {moreItems.map(item => (
          <Link key={item.to} to={item.to}
            className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-qasmia-bg text-qasmia-navy flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <span className="font-medium text-sm text-qasmia-text">{t(item.en, item.ur)}</span>
          </Link>
        ))}
      </div>

      <button onClick={logout}
        className="w-full card flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <LogOut size={20} className="text-red-500"/>
        </div>
        <span className="font-semibold text-sm">{t('Logout','لاگ آوٹ')}</span>
      </button>
    </div>
  )
}
