import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, ChevronRight, FileText, CheckCircle, Clock } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { Exam } from '../../types'
import { formatDate } from '../../utils/helpers'
import api from '../../utils/api'

const catColors: Record<string, string> = {
  monthly: 'bg-blue-100 text-blue-700', term: 'bg-purple-100 text-purple-700',
  annual: 'bg-red-100 text-red-700',   hifz: 'bg-qasmia-navy text-white',
  nazra: 'bg-qasmia-pink text-white',  tajweed: 'bg-teal-100 text-teal-700',
}

function ExamList() {
  const { t } = useLang()
  const [exams, setExams]   = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/exams')
      .then(r => setExams(r.data.data?.items ?? r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('Exams', 'امتحانات')}</h1>
        <Link to="/exams/new" className="btn-pink flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus size={16} /> {t('Create', 'بنائیں')}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12"><span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" /></div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('No exams yet.', 'ابھی کوئی امتحان نہیں۔')}</div>
      ) : (
        <div className="space-y-2">
          {exams.map(exam => (
            <div key={exam.id} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${exam.published ? 'bg-green-100' : 'bg-gray-100'}`}>
                {exam.published ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-qasmia-text text-sm truncate">{exam.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catColors[exam.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {exam.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(exam.date)}</span>
                  <span className="text-xs text-gray-400">{exam.totalMarks} {t('marks', 'نمبر')}</span>
                </div>
              </div>
              <button className="text-xs text-qasmia-navy font-semibold hover:text-qasmia-pink transition">
                {t('Enter Marks', 'نمبر درج')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateExam() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const { register, handleSubmit } = useForm<any>()

  const onSubmit = async (data: any) => {
    setSaving(true)
    setError('')
    try { await api.post('/exams', data); navigate('/exams') }
    catch (err: any) { setError(err?.response?.data?.message ?? t('Failed.', 'ناکام۔')) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/exams" className="text-gray-400"><ChevronRight size={18} className="rotate-180" /></Link>
        <h1 className="page-title">{t('Create Exam', 'امتحان بنائیں')}</h1>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="card space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Title *', 'عنوان *')}</label>
            <input {...register('title', { required: true })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Category', 'قسم')}</label>
              <select {...register('category')} className="input-field">
                {['monthly','term','annual','hifz','nazra','tajweed','islamiat','custom'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Class', 'کلاس')}</label>
              <select {...register('classId')} className="input-field">
                <option value="c1">Hifz Class A</option>
                <option value="c2">Nazra Class B</option>
                <option value="c3">Qaida Class</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Date', 'تاریخ')}</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Total Marks', 'کل نمبر')}</label>
              <input {...register('totalMarks', { valueAsNumber: true })} type="number" className="input-field" defaultValue={100} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Passing Marks', 'پاس نمبر')}</label>
              <input {...register('passingMarks', { valueAsNumber: true })} type="number" className="input-field" defaultValue={40} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Syllabus', 'نصاب')}</label>
            <textarea {...register('syllabus')} rows={3} className="input-field resize-none" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? t('Saving…', 'محفوظ…') : t('Create Exam', 'امتحان بنائیں')}
        </button>
      </form>
    </div>
  )
}

export default function ExamsPage() {
  return (
    <Routes>
      <Route index element={<ExamList />} />
      <Route path="new" element={<CreateExam />} />
    </Routes>
  )
}
