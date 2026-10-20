import { useEffect, useState } from 'react'
import { User, Phone, MapPin, BookOpen, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLang } from '../../context/LangContext'
import { Student } from '../../types'
import { formatDate } from '../../utils/helpers'
import api from '../../utils/api'

export default function StudentProfile() {
  const { t } = useLang()
  const [profile, setProfile] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [changingPw, setChangingPw] = useState(false)
  const [pwSaved, setPwSaved]       = useState(false)
  const [pwError, setPwError]       = useState('')

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{
    newPassword: string; confirmPassword: string
  }>()

  useEffect(() => {
    api.get('/student/my-profile')
      .then(r => setProfile(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onChangePw = async (data: { newPassword: string; confirmPassword: string }) => {
    setPwError('')
    try {
      await api.post('/auth/change-password', { newPassword: data.newPassword })
      setPwSaved(true)
      reset()
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? t('Failed.', 'ناکام۔'))
    }
  }

  if (loading) return (
    <div className="text-center py-12">
      <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
    </div>
  )

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="page-title">{t('My Profile', 'میرا پروفائل')}</h1>

      {/* Student info */}
      <div className="card space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-qasmia-navy to-qasmia-navylt flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {profile?.fullName?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="font-bold text-qasmia-navy text-lg">{profile?.fullName ?? '—'}</p>
            {profile?.fullNameUrdu && <p className="text-sm text-gray-400" dir="rtl">{profile.fullNameUrdu}</p>}
            <p className="text-xs font-mono text-qasmia-pink font-bold">{profile?.studentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoRow icon={<BookOpen size={14}/>} label={t('Class', 'کلاس')} value={profile?.classId ?? '—'} />
          <InfoRow icon={<User size={14}/>} label={t('Gender', 'جنس')} value={profile?.gender === 'male' ? t('Male','مذکر') : t('Female','مؤنث')} />
          {profile?.dateOfBirth && (
            <InfoRow icon={<User size={14}/>} label={t('Date of Birth', 'تاریخ پیدائش')} value={formatDate(profile.dateOfBirth)} />
          )}
          <InfoRow icon={<User size={14}/>} label={t('Enrolled', 'داخلہ تاریخ')} value={profile?.enrollmentDate ? formatDate(profile.enrollmentDate) : '—'} />
        </div>
      </div>

      {/* Guardian */}
      <div className="card space-y-2">
        <p className="font-semibold text-qasmia-navy text-sm border-b border-gray-100 pb-2">
          {t('Guardian Information', 'سرپرست کی معلومات')}
        </p>
        <InfoRow icon={<User size={14}/>}     label={t('Name', 'نام')}       value={profile?.guardianName ?? '—'} />
        {profile?.guardianPhone && (
          <InfoRow icon={<Phone size={14}/>}  label={t('Phone', 'فون')}      value={profile.guardianPhone} />
        )}
        {profile?.guardianRelation && (
          <InfoRow icon={<User size={14}/>}   label={t('Relation', 'رشتہ')}  value={profile.guardianRelation} />
        )}
        {profile?.address && (
          <InfoRow icon={<MapPin size={14}/>} label={t('Address', 'پتہ')}    value={profile.address} />
        )}
      </div>

      {/* Change password */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Lock size={15} className="text-qasmia-pink" />
          <p className="font-semibold text-qasmia-navy text-sm">{t('Change Password', 'پاس ورڈ تبدیل کریں')}</p>
        </div>

        {pwSaved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-xl">
            ✓ {t('Password changed successfully!', 'پاس ورڈ تبدیل ہو گیا!')}
          </div>
        )}
        {pwError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl">
            {pwError}
          </div>
        )}

        <form onSubmit={handleSubmit(onChangePw)} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('New Password', 'نیا پاس ورڈ')}</label>
            <input
              {...register('newPassword', {
                required: t('Required', 'ضروری'),
                minLength: { value: 6, message: t('Min 6 characters', 'کم از کم 6 حروف') }
              })}
              type="password"
              className="input-field"
              placeholder={t('Min 6 characters', 'کم از کم 6 حروف')}
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Confirm Password', 'تصدیق')}</label>
            <input
              {...register('confirmPassword', {
                required: t('Required', 'ضروری'),
                validate: v => v === watch('newPassword') || t('Passwords do not match', 'پاس ورڈ مماثل نہیں')
              })}
              type="password"
              className="input-field"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" className="btn-primary w-full py-2.5 text-sm">
            {t('Update Password', 'پاس ورڈ اپڈیٹ کریں')}
          </button>
        </form>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm font-medium text-qasmia-text">{value}</p>
      </div>
    </div>
  )
}
