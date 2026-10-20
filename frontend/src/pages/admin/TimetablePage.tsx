import { useLang } from '../../context/LangContext'

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const daysUr = ['پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ']

const timetable: Record<string, { time: string; class: string; ustad: string }[]> = {
  Monday:    [{ time:'7:00 – 8:30',  class:'Hifz Class A',  ustad:'Hafiz Rashid' }, { time:'8:30 – 10:00', class:'Nazra Class B', ustad:'Maulana Tariq' }],
  Tuesday:   [{ time:'7:00 – 8:30',  class:'Qaida Class',   ustad:'Qari Asif' },    { time:'8:30 – 10:00', class:'Hifz Class A',  ustad:'Hafiz Rashid' }],
  Wednesday: [{ time:'7:00 – 8:30',  class:'Hifz Class A',  ustad:'Hafiz Rashid' }, { time:'8:30 – 10:00', class:'Tajweed Class', ustad:'Maulana Tariq' }],
  Thursday:  [{ time:'7:00 – 8:30',  class:'Nazra Class B', ustad:'Maulana Tariq' }],
  Friday:    [{ time:'7:00 – 8:00',  class:'Hifz Class A',  ustad:'Hafiz Rashid' }],
  Saturday:  [{ time:'8:00 – 10:00', class:'All Classes',    ustad:'Full Staff' }],
}

const classColors: Record<string, string> = {
  'Hifz Class A':'bg-qasmia-navy text-white', 'Nazra Class B':'bg-qasmia-pink text-white',
  'Qaida Class':'bg-purple-500 text-white', 'Tajweed Class':'bg-blue-500 text-white',
  'All Classes':'bg-green-500 text-white',
}

export default function TimetablePage() {
  const { t } = useLang()
  const today = new Date().toLocaleDateString('en',{weekday:'long'})

  return (
    <div className="space-y-4">
      <h1 className="page-title">{t('Timetable','وقت نامہ')}</h1>
      <div className="space-y-3">
        {days.map((day, di) => (
          <div key={day} className={`card ${day === today ? 'ring-2 ring-qasmia-pink' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <p className="font-bold text-qasmia-navy text-sm">{t(day, daysUr[di])}</p>
              {day === today && (
                <span className="text-[10px] bg-qasmia-pink text-white px-2 py-0.5 rounded-full font-bold">
                  {t('Today','آج')}
                </span>
              )}
            </div>
            {timetable[day]?.length ? (
              <div className="space-y-2">
                {timetable[day].map((slot, si) => (
                  <div key={si} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-24 flex-shrink-0">{slot.time}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${classColors[slot.class] ?? 'bg-gray-100 text-gray-600'}`}>
                      {slot.class}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">👤 {slot.ustad}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-300">{t('No classes scheduled','کوئی کلاس نہیں')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
