import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight, ChevronLeft, Save, BookOpen } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { Student, QuranAssessment } from '../../types'
import { todayISO } from '../../utils/helpers'
import api from '../../utils/api'

const mockStudents: Student[] = [
  { id:'s1', studentId:'QSM-001', fullName:'Muhammad Ali',  gender:'male', classId:'c1', enrollmentDate:'', enrollmentStatus:'active', guardianName:'', createdAt:'' },
  { id:'s2', studentId:'QSM-002', fullName:'Ahmed Raza',    gender:'male', classId:'c1', enrollmentDate:'', enrollmentStatus:'active', guardianName:'', createdAt:'' },
  { id:'s3', studentId:'QSM-003', fullName:'Abdullah Shah', gender:'male', classId:'c1', enrollmentDate:'', enrollmentStatus:'active', guardianName:'', createdAt:'' },
  { id:'s4', studentId:'QSM-004', fullName:'Hassan Noor',   gender:'male', classId:'c1', enrollmentDate:'', enrollmentStatus:'active', guardianName:'', createdAt:'' },
]

type ProgressForm = {
  sabaqSurah: string
  sabaqPara: string
  sabaqVerseStart: number
  sabaqVerseEnd: number
  sabaqAssessment: QuranAssessment
  sabqiPortion: string
  sabqiCompleted: boolean
  sabqiAssessment: QuranAssessment
  manzilPortion: string
  manzilCompleted: boolean
  manzilAssessment: QuranAssessment
  mistakes: number
  tajweed: QuranAssessment
  ustadNotes: string
}

const assessments: { value: QuranAssessment; en: string; ur: string; color: string }[] = [
  { value: 'excellent',      en: 'Excellent',      ur: 'بہترین',         color: 'bg-green-500 text-white' },
  { value: 'good',           en: 'Good',           ur: 'اچھا',           color: 'bg-blue-500 text-white' },
  { value: 'needs_revision', en: 'Needs Revision', ur: 'نظرثانی درکار',  color: 'bg-yellow-500 text-white' },
  { value: 'not_prepared',   en: 'Not Prepared',   ur: 'تیار نہیں',      color: 'bg-red-500 text-white' },
]

function AssessmentPicker({
  value, onChange, label
}: { value: QuranAssessment; onChange: (v: QuranAssessment) => void; label: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 block mb-1.5">{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {assessments.map(a => (
          <button
            key={a.value}
            type="button"
            onClick={() => onChange(a.value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
              value === a.value ? a.color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label.includes('Sabaq') || label.includes('سبق') ? a.en : a.en.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const { t } = useLang()
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [idx, setIdx] = useState(0)
  const [date] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProgressForm>({
    defaultValues: {
      sabaqAssessment: 'good',
      sabqiCompleted: false,
      sabqiAssessment: 'good',
      manzilCompleted: false,
      manzilAssessment: 'good',
      tajweed: 'good',
      mistakes: 0,
    }
  })

  useEffect(() => {
    api.get('/students?classId=c1')
      .then(r => setStudents(r.data.data?.items ?? r.data.data ?? mockStudents))
      .catch(() => setStudents(mockStudents))
  }, [])

  const student = students[idx]
  const isSaved = savedIds.has(student?.id)

  const onSubmit = async (data: ProgressForm) => {
    if (!student) return
    setSaving(true)
    try {
      await api.post('/quran-progress', { studentId: student.id, classId: 'c1', date, ...data })
      setSavedIds(prev => new Set([...prev, student.id]))
      // move to next student
      if (idx < students.length - 1) {
        setIdx(idx + 1)
        reset()
      }
    } catch {
      alert(t('Failed to save progress.', 'پیشرفت محفوظ نہیں ہوئی۔'))
    } finally {
      setSaving(false)
    }
  }

  if (!student) return <div className="text-center py-12 text-gray-400">{t('No students found.', 'کوئی طالب علم نہیں۔')}</div>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="page-title">{t('Daily Quran Progress', 'روزانہ قرآن پیشرفت')}</h1>

      {/* Student navigator */}
      <div className="card flex items-center gap-3">
        <button
          onClick={() => { setIdx(Math.max(0, idx - 1)); reset() }}
          disabled={idx === 0}
          className="p-2 rounded-xl bg-qasmia-bg text-qasmia-navy disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-green-500' : 'bg-gray-300'}`} />
            <p className="font-bold text-qasmia-navy">{student.fullName}</p>
          </div>
          <p className="text-xs text-gray-400">{student.studentId} · {t('Student', 'طالب علم')} {idx + 1}/{students.length}</p>
        </div>
        <button
          onClick={() => { setIdx(Math.min(students.length - 1, idx + 1)); reset() }}
          disabled={idx === students.length - 1}
          className="p-2 rounded-xl bg-qasmia-bg text-qasmia-navy disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {students.map((s, i) => (
          <div key={s.id} className={`h-2 rounded-full transition-all ${
            i === idx ? 'w-6 bg-qasmia-navy' : savedIds.has(s.id) ? 'w-2 bg-green-400' : 'w-2 bg-gray-200'
          }`} />
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Sabaq */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-qasmia-pink" />
            <p className="font-semibold text-qasmia-navy text-sm">{t('Sabaq (New Lesson)', 'سبق (نیا سبق)')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Surah', 'سورۃ')}</label>
              <input {...register('sabaqSurah')} className="input-field" placeholder="e.g. Al-Mulk" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Para/Juz', 'پارہ')}</label>
              <input {...register('sabaqPara')} className="input-field" placeholder="e.g. 29" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Verse Start', 'آیت شروع')}</label>
              <input {...register('sabaqVerseStart', { valueAsNumber: true })} type="number" min="1" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Verse End', 'آیت ختم')}</label>
              <input {...register('sabaqVerseEnd', { valueAsNumber: true })} type="number" min="1" className="input-field" />
            </div>
          </div>
          <AssessmentPicker
            value={watch('sabaqAssessment')}
            onChange={v => setValue('sabaqAssessment', v)}
            label={t('Sabaq Assessment', 'سبق کا جائزہ')}
          />
        </div>

        {/* Sabqi */}
        <div className="card space-y-3">
          <p className="font-semibold text-qasmia-navy text-sm">{t("Sabqi (Yesterday's Revision)", 'سبقی (کل کی تکرار)')}</p>
          <input {...register('sabqiPortion')} className="input-field" placeholder={t('Revision portion…', 'تکرار کا حصہ…')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="sabqiDone" {...register('sabqiCompleted')} className="rounded" />
            <label htmlFor="sabqiDone" className="text-sm text-qasmia-text">{t('Completed', 'مکمل')}</label>
          </div>
          <AssessmentPicker
            value={watch('sabqiAssessment')}
            onChange={v => setValue('sabqiAssessment', v)}
            label={t('Sabqi Assessment', 'سبقی کا جائزہ')}
          />
        </div>

        {/* Manzil */}
        <div className="card space-y-3">
          <p className="font-semibold text-qasmia-navy text-sm">{t('Manzil (Long-term Revision)', 'منزل (طویل تکرار)')}</p>
          <input {...register('manzilPortion')} className="input-field" placeholder={t('Manzil portion…', 'منزل کا حصہ…')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="manzilDone" {...register('manzilCompleted')} className="rounded" />
            <label htmlFor="manzilDone" className="text-sm text-qasmia-text">{t('Completed', 'مکمل')}</label>
          </div>
          <AssessmentPicker
            value={watch('manzilAssessment')}
            onChange={v => setValue('manzilAssessment', v)}
            label={t('Manzil Assessment', 'منزل کا جائزہ')}
          />
        </div>

        {/* Overall */}
        <div className="card space-y-3">
          <p className="font-semibold text-qasmia-navy text-sm">{t('Overall Assessment', 'مجموعی جائزہ')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Mistakes', 'غلطیاں')}</label>
              <input {...register('mistakes', { valueAsNumber: true })} type="number" min="0" className="input-field" />
            </div>
          </div>
          <AssessmentPicker
            value={watch('tajweed')}
            onChange={v => setValue('tajweed', v)}
            label={t('Tajweed', 'تجوید')}
          />
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Ustad Notes', 'استاد کے نوٹس')}</label>
            <textarea
              {...register('ustadNotes')}
              rows={3}
              className="input-field resize-none"
              placeholder={t('e.g. Good recitation; practice Tajweed', 'مثلاً اچھی تلاوت؛ تجوید مشق کریں')}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving || isSaved}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
            isSaved ? 'bg-green-500 text-white' : 'btn-primary'
          }`}
        >
          {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          {isSaved
            ? t('✓ Saved – Next Student →', '✓ محفوظ – اگلا طالب علم')
            : saving
            ? t('Saving…', 'محفوظ ہو رہا ہے…')
            : t('Save & Next', 'محفوظ کریں اور آگے')}
        </button>
      </form>
    </div>
  )
}
