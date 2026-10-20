import { useEffect, useState } from 'react'
import { Check, X, Clock, Calendar, Save } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { AttendanceStatus, Student } from '../../types'
import { attendanceLabel, todayISO } from '../../utils/helpers'
import api from '../../utils/api'

type Row = { student: Student; status: AttendanceStatus; note: string }

const statusOptions: AttendanceStatus[] = ['present', 'absent', 'late', 'approved_leave']

const statusIcon: Record<string, React.ReactNode> = {
  present:        <Check size={14} />,
  absent:         <X size={14} />,
  late:           <Clock size={14} />,
  approved_leave: <Calendar size={14} />,
}

export default function AttendancePage() {
  const { t } = useLang()
  const [date, setDate]       = useState(todayISO())
  const [classId, setClassId] = useState('c1')
  const [rows, setRows]       = useState<Row[]>([])
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/students?classId=${classId}&status=active`)
      .then(r => {
        const students: Student[] = r.data.data?.items ?? r.data.data ?? []
        setRows(students.map(s => ({ student: s, status: 'not_marked', note: '' })))
        setSaved(false)
      })
      .catch(() => setError(t('Failed to load students. Check backend connection.', 'طلباء لوڈ نہیں ہوئے۔')))
      .finally(() => setLoading(false))
  }, [classId])

  const setStatus = (id: string, status: AttendanceStatus) => {
    setRows(rows.map(r => r.student.id === id ? { ...r, status } : r))
    setSaved(false)
  }

  const markAll = (status: AttendanceStatus) => {
    setRows(rows.map(r => ({ ...r, status })))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/attendance/bulk', {
        classId,
        date,
        records: rows.map(r => ({ studentId: r.student.id, status: r.status, note: r.note }))
      })
      setSaved(true)
    } catch {
      alert(t('Failed to save attendance. Please try again.', 'حاضری محفوظ نہیں ہوئی۔'))
    } finally {
      setSaving(false)
    }
  }

  const presentCount = rows.filter(r => r.status === 'present').length
  const absentCount  = rows.filter(r => r.status === 'absent').length
  const notMarked    = rows.filter(r => r.status === 'not_marked').length

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="page-title">{t('Attendance', 'حاضری')}</h1>

      {/* Controls */}
      <div className="card flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Date', 'تاریخ')}</label>
          <input type="date" value={date} onChange={e => { setDate(e.target.value); setSaved(false) }} className="input-field" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Class', 'کلاس')}</label>
          <select value={classId} onChange={e => setClassId(e.target.value)} className="input-field">
            <option value="c1">Hifz Class A</option>
            <option value="c2">Nazra Class B</option>
            <option value="c3">Qaida Class</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
          <p className="mt-3 text-sm">{t('Loading students…', 'طلباء لوڈ ہو رہے ہیں…')}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>{t('No students in this class.', 'اس کلاس میں کوئی طالب علم نہیں۔')}</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex gap-2">
            <span className="badge-present px-3 py-1">{t('Present', 'حاضر')}: {presentCount}</span>
            <span className="badge-absent px-3 py-1">{t('Absent', 'غیر حاضر')}: {absentCount}</span>
            {notMarked > 0 && (
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">
                {t('Unmarked', 'غیر نشان زد')}: {notMarked}
              </span>
            )}
          </div>

          {/* Bulk buttons */}
          <div className="flex gap-2">
            <button onClick={() => markAll('present')} className="btn-primary text-xs py-2 px-4">
              ✓ {t('Mark All Present', 'سب حاضر')}
            </button>
            <button onClick={() => markAll('absent')} className="bg-red-500 text-white text-xs font-semibold py-2 px-4 rounded-xl hover:bg-red-600 transition">
              ✗ {t('Mark All Absent', 'سب غیر حاضر')}
            </button>
          </div>

          {/* Student rows */}
          <div className="space-y-2">
            {rows.map(row => (
              <div key={row.student.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-qasmia-bg flex items-center justify-center text-qasmia-navy font-bold text-sm flex-shrink-0">
                  {row.student.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-qasmia-text truncate">{row.student.fullName}</p>
                  <p className="text-xs text-gray-400">{row.student.studentId}</p>
                </div>
                <div className="flex gap-1.5">
                  {statusOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(row.student.id, s)}
                      title={attendanceLabel[s].en}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all
                        ${row.status === s
                          ? s === 'present'        ? 'bg-green-500 text-white shadow-sm'
                          : s === 'absent'         ? 'bg-red-500 text-white shadow-sm'
                          : s === 'late'           ? 'bg-yellow-400 text-white shadow-sm'
                          : 'bg-blue-400 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }
                      `}
                    >
                      {statusIcon[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              saved ? 'bg-green-500 text-white' : 'btn-primary'
            }`}
          >
            {saving
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} />
            }
            {saved
              ? t('✓ Attendance Saved', '✓ حاضری محفوظ')
              : saving
              ? t('Saving…', 'محفوظ ہو رہا ہے…')
              : t('Save Attendance', 'حاضری محفوظ کریں')}
          </button>
        </>
      )}
    </div>
  )
}
