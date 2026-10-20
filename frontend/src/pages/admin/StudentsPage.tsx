import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Search, Plus, ChevronRight, Eye, EyeOff, User, Lock } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { Student } from '../../types'
import api from '../../utils/api'

// ── Student List ───────────────────────────────────────────────
function StudentList() {
  const { t } = useLang()
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'all' | 'active' | 'withdrawn'>('active')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/students?status=${filter}`)
      .then(r => setStudents(r.data.data?.items ?? r.data.data ?? []))
      .catch(() => setError(t('Failed to load students.', 'طلباء لوڈ نہیں ہوئے۔')))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('Students', 'طلباء')}</h1>
        <Link to="/students/new" className="btn-pink flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus size={16} /> {t('Admit', 'داخلہ')}
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
          placeholder={t('Search by name or ID…', 'نام یا آئی ڈی سے تلاش کریں…')}
        />
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'withdrawn'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              filter === f ? 'bg-qasmia-navy text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
            {t(f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Withdrawn',
               f === 'all' ? 'سب' : f === 'active' ? 'فعال' : 'خارج')}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400">{filtered.length} {t('students', 'طلباء')}</p>
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                {t('No students found.', 'کوئی طالب علم نہیں ملا۔')}
              </div>
            ) : filtered.map(s => (
              <Link key={s.id} to={`/students/${s.id}`}>
                <div className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow mt-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-qasmia-navy to-qasmia-navylt flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {s.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-qasmia-text text-sm truncate">{s.fullName}</p>
                    <p className="text-xs text-gray-400">
                      {s.studentId} · {t('Login', 'لاگ ان')}: <span className="font-mono text-qasmia-navy">{s.studentId}</span>
                    </p>
                    <p className="text-xs text-gray-400">{t('Guardian', 'والدین')}: {s.guardianName}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      s.enrollmentStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.enrollmentStatus === 'active' ? t('Active', 'فعال') : t('Withdrawn', 'خارج')}
                    </span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Admission Form ─────────────────────────────────────────────
interface AdmissionFormData {
  fullName: string
  fullNameUrdu?: string
  dateOfBirth?: string
  gender: 'male' | 'female'
  classId: string
  enrollmentDate?: string
  guardianName: string
  guardianPhone?: string
  guardianRelation?: string
  address?: string
  notes?: string
  loginPassword: string
  confirmPassword: string
}

function AdmissionForm() {
  const { t } = useLang()
  const navigate  = useNavigate()
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [admitted, setAdmitted] = useState<{ studentId: string; fullName: string } | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AdmissionFormData>()

  const onSubmit = async (data: AdmissionFormData) => {
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/students', {
        fullName:         data.fullName,
        fullNameUrdu:     data.fullNameUrdu,
        dateOfBirth:      data.dateOfBirth,
        gender:           data.gender,
        classId:          data.classId,
        enrollmentDate:   data.enrollmentDate,
        guardianName:     data.guardianName,
        guardianPhone:    data.guardianPhone,
        guardianRelation: data.guardianRelation,
        address:          data.address,
        notes:            data.notes,
        loginPassword:    data.loginPassword,   // backend will create user account
      })
      setAdmitted({
        studentId: res.data.data.student_id ?? res.data.data.studentId,
        fullName:  res.data.data.full_name  ?? res.data.data.fullName,
      })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('Failed to admit student.', 'داخلہ نہیں ہوا۔'))
    } finally {
      setSaving(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────
  if (admitted) {
    return (
      <div className="max-w-sm mx-auto text-center space-y-6 pt-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <span className="text-4xl">✓</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-qasmia-navy">{t('Student Admitted!', 'طالب علم داخل ہو گیا!')}</h2>
          <p className="text-sm text-gray-500 mt-1">{admitted.fullName}</p>
        </div>

        {/* Login credentials card */}
        <div className="card bg-qasmia-navy text-white text-left space-y-3">
          <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
            {t('Student Login Credentials', 'طالب علم لاگ ان تفصیل')}
          </p>
          <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-200" />
              <div>
                <p className="text-[10px] text-blue-200">{t('Username', 'یوزر نیم')}</p>
                <p className="font-bold font-mono text-lg">{admitted.studentId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-blue-200" />
              <div>
                <p className="text-[10px] text-blue-200">{t('Password', 'پاس ورڈ')}</p>
                <p className="text-sm text-white/80">{t('As set during admission', 'داخلے کے وقت سیٹ کردہ')}</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-blue-200/70 text-center">
            {t('Share these credentials with the student/guardian', 'یہ تفصیل طالب علم یا والدین کو دیں')}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setAdmitted(null)} className="btn-outline flex-1 text-sm py-2.5">
            {t('Admit Another', 'دوسرا داخلہ')}
          </button>
          <button onClick={() => navigate('/students')} className="btn-primary flex-1 text-sm py-2.5">
            {t('View Students', 'طلباء دیکھیں')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/students" className="text-gray-400 hover:text-qasmia-navy">
          <ChevronRight size={18} className="rotate-180" />
        </Link>
        <h1 className="page-title">{t('Admit New Student', 'نیا طالب علم داخل کریں')}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── Student Info ────────────────────────────────── */}
        <div className="card space-y-3">
          <p className="font-semibold text-qasmia-navy text-sm border-b border-gray-100 pb-2">
            {t('Student Information', 'طالب علم کی معلومات')}
          </p>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Full Name *', 'پورا نام *')}</label>
            <input {...register('fullName', { required: t('Required', 'ضروری') })} className="input-field" placeholder={t('e.g. Muhammad Ali', 'مثلاً محمد علی')} />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Full Name (Urdu)', 'پورا نام (اردو)')}</label>
            <input {...register('fullNameUrdu')} className="input-field" dir="rtl" placeholder="محمد علی" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Date of Birth', 'تاریخ پیدائش')}</label>
              <input {...register('dateOfBirth')} type="date" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Gender', 'جنس')}</label>
              <select {...register('gender')} className="input-field">
                <option value="male">{t('Male', 'مذکر')}</option>
                <option value="female">{t('Female', 'مؤنث')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Class *', 'کلاس *')}</label>
              <select {...register('classId', { required: t('Required', 'ضروری') })} className="input-field">
                <option value="">-- {t('Select', 'منتخب کریں')} --</option>
                <option value="c1">Hifz Class A</option>
                <option value="c2">Nazra Class B</option>
                <option value="c3">Qaida Class</option>
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Enroll Date', 'داخلہ تاریخ')}</label>
              <input {...register('enrollmentDate')} type="date" className="input-field" />
            </div>
          </div>
        </div>

        {/* ── Guardian Info ────────────────────────────────── */}
        <div className="card space-y-3">
          <p className="font-semibold text-qasmia-navy text-sm border-b border-gray-100 pb-2">
            {t('Guardian Information', 'سرپرست کی معلومات')}
          </p>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Guardian Name *', 'سرپرست کا نام *')}</label>
            <input {...register('guardianName', { required: t('Required', 'ضروری') })} className="input-field" />
            {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Phone', 'فون')}</label>
              <input {...register('guardianPhone')} className="input-field" type="tel" placeholder="03xxxxxxxxx" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Relation', 'رشتہ')}</label>
              <input {...register('guardianRelation')} className="input-field" placeholder={t('Father', 'والد')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Address', 'پتہ')}</label>
            <textarea {...register('address')} rows={2} className="input-field resize-none" />
          </div>
        </div>

        {/* ── Login Credentials ────────────────────────────── */}
        <div className="card space-y-3 border-2 border-qasmia-pink/20">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Lock size={16} className="text-qasmia-pink" />
            <p className="font-semibold text-qasmia-navy text-sm">
              {t('Student Login Credentials', 'طالب علم کی لاگ ان تفصیل')}
            </p>
          </div>

          {/* Username - auto generated, read only */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">
              {t('Username (Auto)', 'یوزر نیم (خودکار)')}
            </label>
            <div className="input-field bg-gray-50 text-gray-400 flex items-center gap-2">
              <User size={14} />
              <span className="font-mono text-sm">{t('QSM-XXX (auto-assigned)', 'QSM-XXX (خودکار)')}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {t('Username will be the Student ID (QSM-001, QSM-002…)', 'یوزر نیم خودکار طور پر طالب علم کی آئی ڈی ہوگی')}
            </p>
          </div>

          {/* Password set by Ustad */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">
              {t('Set Password *', 'پاس ورڈ سیٹ کریں *')}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('loginPassword', {
                  required: t('Password is required', 'پاس ورڈ ضروری ہے'),
                  minLength: { value: 6, message: t('Minimum 6 characters', 'کم از کم 6 حروف') }
                })}
                type={showPw ? 'text' : 'password'}
                className="input-field pl-9 pr-10"
                placeholder={t('Min 6 characters', 'کم از کم 6 حروف')}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.loginPassword && <p className="text-red-500 text-xs mt-1">{errors.loginPassword.message}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">
              {t('Confirm Password *', 'پاس ورڈ تصدیق *')}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('confirmPassword', {
                  required: t('Required', 'ضروری'),
                  validate: v => v === watch('loginPassword') || t('Passwords do not match', 'پاس ورڈ مماثل نہیں')
                })}
                type={showPw ? 'text' : 'password'}
                className="input-field pl-9"
                placeholder={t('Re-enter password', 'دوبارہ پاس ورڈ')}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            💡 {t(
              'Student will log in with their Student ID (e.g. QSM-001) and this password to view their own progress, attendance and fees.',
              'طالب علم اپنی آئی ڈی (مثلاً QSM-001) اور اس پاس ورڈ سے لاگ ان کر کے اپنی پیشرفت، حاضری اور فیس دیکھ سکے گا۔'
            )}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? t('Admitting…', 'داخلہ ہو رہا ہے…') : t('Admit Student & Create Login', 'طالب علم داخل کریں اور لاگ ان بنائیں')}
        </button>
      </form>
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Routes>
      <Route index element={<StudentList />} />
      <Route path="new" element={<AdmissionForm />} />
    </Routes>
  )
}
