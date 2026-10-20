import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, BookOpen, Lock, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const { t, lang, setLang } = useLang()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setError('')
    setLoading(true)
    try {
      await login(data.username, data.password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        t('Invalid username or password.', 'غلط صارف نام یا پاس ورڈ۔')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-qasmia-bg flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Qasmia" className="h-20 w-20 rounded-2xl shadow-card mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-qasmia-navy">Qasmia</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('Quran & Education', 'قرآن اور تعلیم')}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-qasmia-text mb-1.5">
              {t('Username', 'صارف نام')}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('username', { required: t('Username is required', 'صارف نام ضروری ہے') })}
                className="input-field pl-9"
                placeholder={t('Enter username', 'صارف نام درج کریں')}
                autoComplete="username"
                autoFocus
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-qasmia-text mb-1.5">
              {t('Password', 'پاس ورڈ')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('password', { required: t('Password is required', 'پاس ورڈ ضروری ہے') })}
                type={showPw ? 'text' : 'password'}
                className="input-field pl-9 pr-10"
                placeholder={t('Enter password', 'پاس ورڈ درج کریں')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BookOpen size={16} />
            )}
            {loading ? t('Signing in…', 'لاگ ان ہو رہا ہے…') : t('Sign In', 'لاگ ان')}
          </button>
        </form>

        {/* Lang toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="mt-6 w-full text-center text-xs text-gray-400 hover:text-qasmia-navy transition"
        >
          {lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Madrasa Qasmia · {t('Admin & Ustad Portal', 'ایڈمن اور استاد پورٹل')}
      </p>
    </div>
  )
}
