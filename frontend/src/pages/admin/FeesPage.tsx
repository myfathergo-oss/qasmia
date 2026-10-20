import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DollarSign, AlertCircle, CheckCircle, Printer, Plus } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { FeeInvoice } from '../../types'
import api from '../../utils/api'

const statusConfig: Record<string, { label: string; urdu: string; color: string; icon: React.ReactNode }> = {
  paid:    { label: 'Paid',    urdu: 'ادا شدہ',    color: 'text-green-600 bg-green-50',   icon: <CheckCircle size={14} /> },
  pending: { label: 'Pending', urdu: 'زیر التواء', color: 'text-yellow-600 bg-yellow-50', icon: <AlertCircle size={14} /> },
  partial: { label: 'Partial', urdu: 'جزوی',       color: 'text-blue-600 bg-blue-50',     icon: <AlertCircle size={14} /> },
  overdue: { label: 'Overdue', urdu: 'بقایا',      color: 'text-red-600 bg-red-50',       icon: <AlertCircle size={14} /> },
}

function FeesList() {
  const { t } = useLang()
  const [invoices, setInvoices] = useState<FeeInvoice[]>([])
  const [filter, setFilter]     = useState<'all' | 'pending' | 'overdue' | 'paid'>('all')
  const [loading, setLoading]   = useState(true)
  const [marking, setMarking]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get('/fees/invoices')
      .then(r => setInvoices(r.data.data?.items ?? r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  const collectFee = async (inv: FeeInvoice) => {
    const amount = prompt(t(
      `Confirm payment for ${inv.student?.fullName}\nAmount due: Rs ${inv.balanceDue}\nEnter amount paid:`,
      `${inv.student?.fullName} کی ادائیگی\nبقایا: Rs ${inv.balanceDue}\nادا شدہ رقم:`
    ))
    if (!amount || isNaN(parseFloat(amount))) return
    setMarking(inv.id)
    try {
      await api.post(`/fees/invoices/${inv.id}/payments`, { amount: parseFloat(amount), method: 'cash' })
      const paid = parseFloat(amount)
      setInvoices(prev => prev.map(i => i.id === inv.id ? {
        ...i,
        paidAmount: i.paidAmount + paid,
        balanceDue: Math.max(0, i.balanceDue - paid),
        status: paid >= i.balanceDue ? 'paid' : 'partial',
      } : i))
    } catch { alert(t('Payment failed.', 'ادائیگی ناکام۔')) }
    finally { setMarking(null) }
  }

  const totalDue  = invoices.reduce((s, i) => s + i.balanceDue, 0)
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('Fees', 'فیس')}</h1>
        <button className="btn-pink flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus size={16} /> {t('Invoice', 'انوائس')}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">Rs {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('Collected', 'وصول')}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-500">Rs {totalDue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('Outstanding', 'بقایا')}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'overdue', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              filter === f ? 'bg-qasmia-navy text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
            {t(f.charAt(0).toUpperCase() + f.slice(1),
               f === 'all' ? 'سب' : f === 'pending' ? 'زیر التواء' : f === 'overdue' ? 'بقایا' : 'ادا شدہ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><span className="w-8 h-8 border-2 border-qasmia-navy/20 border-t-qasmia-navy rounded-full animate-spin inline-block" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('No invoices found.', 'کوئی انوائس نہیں۔')}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => {
            const sc = statusConfig[inv.status]
            return (
              <div key={inv.id} className="card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.color}`}>
                  {sc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-qasmia-text text-sm truncate">{inv.student?.fullName ?? inv.studentId}</p>
                  <p className="text-xs text-gray-400">{inv.student?.studentId} · {inv.month}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>
                      {t(sc.label, sc.urdu)}
                    </span>
                    {inv.balanceDue > 0 && (
                      <span className="text-xs text-red-500 font-semibold">Due: Rs {inv.balanceDue}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {inv.status !== 'paid' && (
                    <button onClick={() => collectFee(inv)} disabled={marking === inv.id}
                      className="text-xs bg-qasmia-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-qasmia-navylt transition">
                      {marking === inv.id ? '…' : t('Collect', 'وصول')}
                    </button>
                  )}
                  <button className="text-xs text-gray-400 flex items-center gap-1 hover:text-qasmia-navy">
                    <Printer size={12} /> {t('Receipt', 'رسید')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FeesPage() {
  return <Routes><Route index element={<FeesList />} /></Routes>
}
