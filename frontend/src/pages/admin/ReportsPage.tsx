import { useLang } from '../../context/LangContext'
import { FileText, Download, Printer, Users, BookOpen, DollarSign, BarChart2 } from 'lucide-react'

const reportTypes = [
  { icon:<Users size={24}/>,    en:'Attendance Register',       ur:'حاضری رجسٹر',       desc:{ en:'Class-wise monthly attendance sheet',   ur:'ماہانہ حاضری رجسٹر' },       color:'bg-blue-500'    },
  { icon:<BookOpen size={24}/>, en:'Student Progress Card',     ur:'طالب علم ترقی کارڈ', desc:{ en:'Individual Quran progress report (PDF)', ur:'انفرادی قرآن پیشرفت' },      color:'bg-qasmia-navy' },
  { icon:<FileText size={24}/>, en:'Exam Result Sheet',         ur:'نتیجہ نامہ',         desc:{ en:'Class exam results & grade summary',     ur:'امتحانی نتائج خلاصہ' },      color:'bg-purple-500'  },
  { icon:<DollarSign size={24}/>,en:'Fee Collection Report',   ur:'فیس رپورٹ',          desc:{ en:'Monthly fee status per student',          ur:'ماہانہ فیس کی رپورٹ' },      color:'bg-green-500'   },
  { icon:<BarChart2 size={24}/>, en:'Class Summary',           ur:'کلاس خلاصہ',         desc:{ en:'Overall class performance overview',      ur:'کلاس کارکردگی جائزہ' },      color:'bg-orange-500'  },
  { icon:<Printer size={24}/>,   en:'Admission Register',      ur:'داخلہ رجسٹر',        desc:{ en:'Complete student enrollment list',        ur:'مکمل داخلہ فہرست' },         color:'bg-teal-500'    },
]

export default function ReportsPage() {
  const { t } = useLang()

  const handleGenerate = (report: typeof reportTypes[0]) => {
    alert(t(
      `Generating: ${report.en}\nThis will create a PDF report. In production, the backend generates a real PDF.`,
      `رپورٹ بن رہی ہے: ${report.ur}`
    ))
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">{t('Reports','رپورٹس')}</h1>

      {/* Filter row */}
      <div className="card flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Class','کلاس')}</label>
          <select className="input-field">
            <option>{t('All Classes','تمام کلاسز')}</option>
            <option>Hifz Class A</option>
            <option>Nazra Class B</option>
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-gray-400 block mb-1">{t('Month','مہینہ')}</label>
          <input type="month" className="input-field" defaultValue="2026-10" />
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reportTypes.map(rep => (
          <div key={rep.en} className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${rep.color}`}>
                {rep.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-qasmia-navy text-sm">{t(rep.en, rep.ur)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t(rep.desc.en, rep.desc.ur)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleGenerate(rep)}
                className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <FileText size={13}/> {t('Generate PDF','PDF بنائیں')}
              </button>
              <button
                onClick={() => handleGenerate(rep)}
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Printer size={13}/> {t('Print','پرنٹ')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card border border-blue-100 bg-blue-50">
        <p className="text-xs text-blue-700 font-semibold">{t('📄 PDF Generation','📄 PDF بنانا')}</p>
        <p className="text-xs text-blue-600 mt-1">
          {t(
            'In production, the backend generates real PDFs using the student data from the database. Reports include bilingual content and proper Urdu RTL formatting.',
            'پروڈکشن میں، بیک اینڈ ڈیٹا بیس سے طالب علم کا ڈیٹا استعمال کر کے حقیقی PDF بناتا ہے۔'
          )}
        </p>
      </div>
    </div>
  )
}
