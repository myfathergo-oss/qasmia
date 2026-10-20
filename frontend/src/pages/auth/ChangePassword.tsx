import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import api from '../../utils/api'

interface Form {
  newPassword: string
  confirmPassword: string
}

export default function ChangePassword() {
  const { user, updateUser, logout } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>()

  const onSubmit = async (data: Form) => {
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/change-password', { newPassword: data.newPassword })
      updateUser({ mustChangePassword: false })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || t('Failed to change password.', 'پاس ورڈ تبدیل نہیں ہوا۔'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-qasmia-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-qasmia-navy rounded-2xl flex items-center justify-center mb-3 shadow-card">
            <ShieldCheck size={32} className="text-qasmia-pink" />
          </div>
          <h1 className="text-xl font-bold text-qasmia-navy">{t('Change Password', 'پاس ورڈ تبدیل کریں')}</h1>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {t('You must set a new password before continuing.', 'جاری رکھنے سے پہلے نیا پاس ورڈ سیٹ کریں۔')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-qasmia-text mb-1.5">
              {t('New Password', 'نیا پاس ورڈ')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('newPassword', {
                  required: t('Required', 'ضروری ہے'),
                  minLength: { value: 8, message: t('Minimum 8 characters', 'کم از کم 8 حروف') }
                })}
                type="password"
                className="input-field pl-9"
                placeholder={t('At least 8 characters', 'کم از کم 8 حروف')}
              />
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-qasmia-text mb-1.5">
              {t('Confirm Password', 'پاس ورڈ تصدیق کریں')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('confirmPassword', {
                  required: t('Required', 'ضروری ہے'),
                  validate: v => v === watch('newPassword') || t('Passwords do not match', 'پاس ورڈ مماثل نہیں')
                })}
                type="password"
                className="input-field pl-9"
                placeholder={t('Re-enter password', 'دوبارہ پاس ورڈ')}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading
              ? t('Saving…', 'محفوظ ہو رہا ہے…')
              : t('Set New Password', 'نیا پاس ورڈ سیٹ کریں')}
          </button>
        </form>

        <button onClick={logout} className="mt-4 w-full text-center text-xs text-gray-400 hover:text-red-500 transition">
          {t('Logout', 'لاگ آوٹ')}
        </button>
      </div>
    </div>
  )
}
