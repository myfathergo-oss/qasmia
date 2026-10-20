import { useEffect, useState } from 'react'
import { useLang } from '../../context/LangContext'
import { AttendanceRecord } from '../../types'
import { attendanceLabel, formatDate } from '../../utils/helpers'
import api from '../../utils/api'

export default function StudentAttendance() {
  const { t } = useLang()
  const [records, setRecords]   = useState<AttendanceRecord[]>([])
  const [loading, setLoading]   = useState(true)
  const [month, setMonth]       = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    setLoading(true)
    api.get(`/student/my-attendance?month=${month}`)
      .then(r => setRecords(r.data.data ?? []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [month])

  const presentDays = records.filter(r => r.status === 'present').length
  const absentDays  = records.filter(r => r.status === 'absent').length
  const total       = records.length
  const pct         = total > 0 ? Math.round((presentDays / total) * 100) : 0

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="page-title">{t('My Attendance', 'میری حاضری')}</h1>

      {/* Month picker */}
      <div className="card">
        <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Month', 'مہینہ')}</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input-field" />
      </div>

      {/* Summary bar */}
      {!loading && records.length > 0 && (
        <div className="card">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-qasmia-navy">{t('This Month', 'اس مہینے')}</span>
            <span className="text-sm font-bold text-qasmia-navy">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${pct >= 75 ? 'bg-green-500' : 'bg-yellow-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span className="text-green-600 font-semibold">{presentDays} {t('Present', 'حاضر')}</span>
            <span className="text-red-500 font-semibold">{absentDays} {t('Absent', 'غیر حاضر')}</span>
            <span>{total} {t('Total Days', 'کل دن')}</span>
          </div>
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          {t('No attendance records for this month.', 'اس مہینے کا کوئی ریکارڈ نہیں۔')}
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(rec => {
            const lbl = attendanceLabel[rec.status]
            return (
              <div key={rec.id} className="card flex items-center gap-3">
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-lg font-bold text-qasmia-navy">
                    {new Date(rec.date).getDate()}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(rec.date).toLocaleDateString('en', { weekday: 'short' })}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{formatDate(rec.date)}</p>
                </div>
                <span className={lbl.color}>{t(lbl.en, lbl.ur)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
