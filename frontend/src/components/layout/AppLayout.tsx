import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useLang } from '../../context/LangContext'

const pageTitles: Record<string, { en: string; ur: string }> = {
  '/dashboard':  { en: 'Dashboard',       ur: 'ڈیش بورڈ' },
  '/students':   { en: 'Students',        ur: 'طلباء' },
  '/classes':    { en: 'Classes',         ur: 'کلاسز' },
  '/attendance': { en: 'Attendance',      ur: 'حاضری' },
  '/progress':   { en: 'Quran Progress',  ur: 'قرآن پیشرفت' },
  '/exams':      { en: 'Exams',           ur: 'امتحانات' },
  '/fees':       { en: 'Fees',            ur: 'فیس' },
  '/news':       { en: 'News',            ur: 'خبریں' },
  '/reports':    { en: 'Reports',         ur: 'رپورٹس' },
  '/timetable':  { en: 'Timetable',       ur: 'وقت نامہ' },
  '/settings':   { en: 'Settings',        ur: 'ترتیبات' },
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const { t } = useLang()

  const titleKey = Object.keys(pageTitles).find(k => pathname.startsWith(k)) ?? '/dashboard'
  const title = pageTitles[titleKey]

  return (
    <div className="min-h-screen bg-qasmia-bg flex flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        title={title ? t(title.en, title.ur) : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Single Sidebar – always visible on desktop, drawer on mobile */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 px-4 py-4 lg:px-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav only on mobile */}
      <BottomNav />
    </div>
  )
}
