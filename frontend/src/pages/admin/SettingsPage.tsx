import { useState } from 'react'
import { Shield, Users, Globe, Bell, Database, ChevronRight } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'

const sections = [
  { icon:<Users size={18}/>,    en:'User Management',    ur:'صارف انتظام',    desc:{ en:'Manage admin and ustad accounts',           ur:'ایڈمن اور استاد اکاؤنٹس' }},
  { icon:<Globe size={18}/>,    en:'Language & Region',  ur:'زبان اور علاقہ', desc:{ en:'Urdu/English, date format, timezone',       ur:'اردو/انگریزی، تاریخ، وقت' }},
  { icon:<Bell size={18}/>,     en:'Notifications',      ur:'اطلاعات',        desc:{ en:'Push notifications and reminders',          ur:'نوٹیفیکیشن اور یاددہانی' }},
  { icon:<Database size={18}/>, en:'Backup & Data',      ur:'بیک اپ اور ڈیٹا', desc:{ en:'Export data, backup and restore options', ur:'ڈیٹا برآمد اور بیک اپ' }},
  { icon:<Shield size={18}/>,   en:'Security',           ur:'سیکیورٹی',       desc:{ en:'Password policy, session, audit logs',      ur:'پاس ورڈ پالیسی، لاگ' }},
]

export default function SettingsPage() {
  const { t } = useLang()
  const { user } = useAuth()
  const [madrasaName, setMadrasaName] = useState('Madrasa Qasmia')

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="page-title">{t('Settings','ترتیبات')}</h1>

      {/* Madrasa info */}
      <div className="card space-y-3">
        <p className="font-semibold text-qasmia-navy text-sm">{t('Madrasa Information','مدرسہ کی معلومات')}</p>
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Madrasa Name','مدرسہ کا نام')}</label>
          <input value={madrasaName} onChange={e => setMadrasaName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Academic Year','تعلیمی سال')}</label>
          <input className="input-field" defaultValue="2026–2027" />
        </div>
        <button className="btn-primary text-sm py-2 px-4">{t('Save','محفوظ')}</button>
      </div>

      {/* Logged in user */}
      <div className="card space-y-1">
        <p className="font-semibold text-qasmia-navy text-sm mb-2">{t('My Account','میرا اکاؤنٹ')}</p>
        <p className="text-sm"><span className="text-gray-400">{t('Username','صارف نام')}: </span><strong>{user?.username}</strong></p>
        <p className="text-sm"><span className="text-gray-400">{t('Role','کردار')}: </span><strong className="capitalize">{user?.role.replace('_',' ')}</strong></p>
        <button className="mt-2 text-xs text-qasmia-pink font-semibold hover:underline">
          {t('Change Password','پاس ورڈ تبدیل کریں')}
        </button>
      </div>

      {/* Settings list */}
      <div className="space-y-2">
        {sections.map(sec => (
          <button key={sec.en} className="card w-full flex items-center gap-3 text-left hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-qasmia-bg flex items-center justify-center text-qasmia-navy flex-shrink-0">
              {sec.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-qasmia-text text-sm">{t(sec.en, sec.ur)}</p>
              <p className="text-xs text-gray-400">{t(sec.desc.en, sec.desc.ur)}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 pb-4">Qasmia v1.0.0 · Madrasa Qasmia</p>
    </div>
  )
}
