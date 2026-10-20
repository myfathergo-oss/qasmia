import { useEffect, useState } from 'react'
import { Plus, Users, BookOpen } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { Class } from '../../types'
import api from '../../utils/api'

const typeColors: Record<string, string> = {
  hifz: 'bg-qasmia-navy', nazra: 'bg-qasmia-pink', qaida: 'bg-purple-500',
  tajweed: 'bg-blue-500', islamiat: 'bg-green-500', general: 'bg-gray-500',
}

export default function ClassesPage() {
  const { t } = useLang()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data.data ?? []))
      .catch(() => setError(t('Failed to load classes.', 'کلاسز لوڈ نہیں ہوئیں۔')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('Classes', 'کلاسز')}</h1>
        <button className="btn-pink flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus size={16} /> {t('Add Class', 'کلاس شامل')}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
        </div>
      ) : classes.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          {t('No classes found. Add your first class.', 'کوئی کلاس نہیں ملی۔ پہلی کلاس شامل کریں۔')}
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => (
            <div key={cls.id} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${typeColors[cls.type] ?? 'bg-gray-500'}`}>
                <BookOpen size={22} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-qasmia-navy">{cls.name}</p>
                {cls.nameUrdu && <p className="text-xs text-gray-400" dir="rtl">{cls.nameUrdu}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} /> {cls.studentCount ?? 0} {t('students', 'طلباء')}
                  </span>
                  {cls.assignedUstad ? (
                    <span className="text-xs text-gray-500">👤 {cls.assignedUstad.fullName}</span>
                  ) : (
                    <span className="text-xs text-red-400">{t('No Ustad assigned', 'استاد نہیں')}</span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg text-white ${typeColors[cls.type]}`}>
                {cls.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
