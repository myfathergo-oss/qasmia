import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Printer } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { FeeInvoice } from '../../types'
import api from '../../utils/api'

const statusConfig: Record<string, { label: string; ur: string; color: string; icon: React.ReactNode }> = {
  paid:    { label: 'Paid',    ur: 'ادا شدہ',    color: 'text-green-600 bg-green-50',   icon: <CheckCircle size={16} /> },
  pending: { label: 'Pending', ur: 'زیر التواء', color: 'text-yellow-600 bg-yellow-50', icon: <AlertCircle size={16} /> },
  partial: { label: 'Partial', ur: 'جزوی',       color: 'text-blue-600 bg-blue-50',     icon: <AlertCircle size={16} /> },
  overdue: { label: 'Overdue', ur: 'بقایا',      color: 'text-red-600 bg-red-50',       icon: <AlertCircle size={16} /> },
}

export default function StudentFees() {
  const { t } = useLang()
  const [invoices, setInvoices] = useState<FeeInvoice[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/student/my-fees')
      .then(r => setInvoices(r.data.data ?? []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))
  }, [])

  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const totalDue  = invoices.reduce((s, i) => s + i.balanceDue, 0)

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="page-title">{t('My Fees', 'میری فیس')}</h1>

      {/* Summary */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-xl font-bold text-green-600">Rs {totalPaid.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('Total Paid', 'کل ادا')}</p>
          </div>
          <div className="card text-center">
            <p className={`text-xl font-bold ${totalDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
              {totalDue > 0 ? `Rs ${totalDue.toLocaleString()}` : t('Clear ✓', 'کلیئر ✓')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{t('Balance Due', 'بقایا')}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          {t('No fee records found.', 'کوئی فیس ریکارڈ نہیں۔')}
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => {
            const sc = statusConfig[inv.status] ?? statusConfig.pending
            return (
              <div key={inv.id} className="card space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-qasmia-navy text-sm">
                      {t('Month', 'مہینہ')}: {inv.month ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{inv.invoiceNumber}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${sc.color}`}>
                    {sc.icon} {t(sc.label, sc.ur)}
                  </span>
                </div>

                {/* Fee items */}
                <div className="space-y-1">
                  {inv.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-gray-500">{item.description}</span>
                      <span className="font-semibold">Rs {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-100 pt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{t('Total', 'کل')}</span>
                    <span className="font-semibold">Rs {inv.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">{t('Paid', 'ادا')}</span>
                    <span className="text-green-600 font-semibold">Rs {inv.paidAmount.toLocaleString()}</span>
                  </div>
                  {inv.balanceDue > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-red-500 font-bold">{t('Balance Due', 'بقایا')}</span>
                      <span className="text-red-500 font-bold">Rs {inv.balanceDue.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Receipt button (read-only for student) */}
                {inv.status === 'paid' && (
                  <button className="w-full flex items-center justify-center gap-2 text-xs text-qasmia-navy font-semibold py-2 border border-qasmia-navy/20 rounded-xl hover:bg-qasmia-bg transition">
                    <Printer size={13} /> {t('View Receipt', 'رسید دیکھیں')}
                  </button>
                )}

                {/* Pending reminder */}
                {inv.balanceDue > 0 && (
                  <p className="text-xs text-center text-red-400">
                    {t('Please contact the Madrasa office to pay the dues.', 'بقایا فیس کے لیے مدرسہ سے رابطہ کریں۔')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
