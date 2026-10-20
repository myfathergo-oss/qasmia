import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="min-h-screen bg-qasmia-bg flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-black text-qasmia-navy/10 mb-4">404</p>
      <h1 className="text-2xl font-bold text-qasmia-navy mb-2">{t('Page Not Found','صفحہ نہیں ملا')}</h1>
      <p className="text-sm text-gray-400 mb-6">{t('The page you are looking for does not exist.','یہ صفحہ موجود نہیں ہے۔')}</p>
      <Link to="/dashboard" className="btn-primary">{t('Back to Dashboard','ڈیش بورڈ پر جائیں')}</Link>
    </div>
  )
}
