import { useEffect, useState } from 'react'
import { BookOpen, Star } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { QuranProgress, QuranAssessment } from '../../types'
import { formatDate } from '../../utils/helpers'
import api from '../../utils/api'

const assessmentBadge: Record<QuranAssessment, { en: string; ur: string; color: string }> = {
  excellent:      { en: 'Excellent',      ur: 'بہترین',        color: 'bg-green-100 text-green-700' },
  good:           { en: 'Good',           ur: 'اچھا',          color: 'bg-blue-100 text-blue-700' },
  needs_revision: { en: 'Needs Revision', ur: 'نظرثانی درکار', color: 'bg-yellow-100 text-yellow-700' },
  not_prepared:   { en: 'Not Prepared',   ur: 'تیار نہیں',     color: 'bg-red-100 text-red-700' },
}

export default function StudentProgress() {
  const { t } = useLang()
  const [records, setRecords] = useState<QuranProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]     = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    setLoading(true)
    api.get(`/student/my-progress?month=${month}`)
      .then(r => setRecords(r.data.data ?? []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [month])

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="page-title">{t('My Quran Progress', 'میری قرآن پیشرفت')}</h1>

      {/* Month picker */}
      <div className="card">
        <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Month', 'مہینہ')}</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input-field" />
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          {t('No progress records for this month.', 'اس مہینے کا کوئی پیشرفت ریکارڈ نہیں۔')}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(rec => (
            <div key={rec.id} className="card space-y-3">
              {/* Date header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-qasmia-pink" />
                  <p className="text-sm font-bold text-qasmia-navy">{formatDate(rec.date)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rec.attendanceStatus === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {rec.attendanceStatus === 'present' ? t('Present', 'حاضر') : t('Absent', 'غیر حاضر')}
                </span>
              </div>

              {/* Sabaq */}
              {rec.sabaqSurah && (
                <div className="bg-qasmia-bg rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Sabaq', 'سبق')}</p>
                  <p className="text-sm font-semibold text-qasmia-navy">
                    {rec.sabaqSurah}
                    {rec.sabaqPara && ` · Para ${rec.sabaqPara}`}
                    {rec.sabaqVerseStart && ` · ${t('Verses', 'آیات')} ${rec.sabaqVerseStart}–${rec.sabaqVerseEnd}`}
                  </p>
                  {rec.sabaqAssessment && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${assessmentBadge[rec.sabaqAssessment].color}`}>
                      {t(assessmentBadge[rec.sabaqAssessment].en, assessmentBadge[rec.sabaqAssessment].ur)}
                    </span>
                  )}
                </div>
              )}

              {/* Sabqi */}
              {rec.sabqiPortion && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Sabqi', 'سبقی')}</p>
                  <p className="text-sm text-qasmia-text">{rec.sabqiPortion}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {rec.sabqiCompleted && (
                      <span className="text-[10px] text-green-600 font-semibold">✓ {t('Completed', 'مکمل')}</span>
                    )}
                    {rec.sabqiAssessment && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${assessmentBadge[rec.sabqiAssessment].color}`}>
                        {t(assessmentBadge[rec.sabqiAssessment].en, assessmentBadge[rec.sabqiAssessment].ur)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Manzil */}
              {rec.manzilPortion && (
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('Manzil', 'منزل')}</p>
                  <p className="text-sm text-qasmia-text">{rec.manzilPortion}</p>
                  {rec.manzilCompleted && (
                    <span className="text-[10px] text-green-600 font-semibold mt-1 block">✓ {t('Completed', 'مکمل')}</span>
                  )}
                </div>
              )}

              {/* Ustad notes */}
              {rec.ustadNotes && (
                <div className="flex items-start gap-2 bg-yellow-50 rounded-xl p-3">
                  <Star size={13} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">{t("Ustad's Note", 'استاد کا نوٹ')}</p>
                    <p className="text-sm text-qasmia-text">{rec.ustadNotes}</p>
                  </div>
                </div>
              )}

              {/* Mistakes + Tajweed */}
              {(rec.mistakes !== undefined || rec.tajweed) && (
                <div className="flex gap-3 text-xs">
                  {rec.mistakes !== undefined && (
                    <span className={`px-2 py-1 rounded-lg font-semibold ${rec.mistakes === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {rec.mistakes} {t('Mistakes', 'غلطیاں')}
                    </span>
                  )}
                  {rec.tajweed && (
                    <span className={`px-2 py-1 rounded-lg font-semibold ${assessmentBadge[rec.tajweed].color}`}>
                      {t('Tajweed', 'تجوید')}: {t(assessmentBadge[rec.tajweed].en, assessmentBadge[rec.tajweed].ur)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
