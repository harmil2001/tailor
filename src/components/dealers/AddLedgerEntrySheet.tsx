'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { addLedgerEntry } from '@/app/(app)/dealers/actions'

type Feedback = { type: 'success' | 'error'; message: string }
type EntryType = 'credit' | 'debit'

const inputCls = 'w-full h-12 px-4 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-[#45464d] uppercase mb-2'

const today = () => new Date().toISOString().split('T')[0]

export default function AddLedgerEntrySheet({ dealerId }: { dealerId: string }) {
  const router = useRouter()
  const [mounted, setMounted]     = useState(false)
  const [open, setOpen]           = useState(false)
  const [entryType, setEntryType] = useState<EntryType>('credit')
  const [billDate, setBillDate]   = useState(today())
  const [particulars, setParticulars] = useState('')
  const [voucherType, setVoucherType] = useState('')
  const [voucherNo, setVoucherNo]     = useState('')
  const [amount, setAmount]           = useState('')
  const [isPending, start]            = useTransition()
  const [feedback, setFeedback]       = useState<Feedback | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (feedback?.type === 'success') {
      const t = setTimeout(() => { setOpen(false); router.refresh() }, 900)
      return () => clearTimeout(t)
    }
    if (feedback?.type === 'error') {
      const t = setTimeout(() => setFeedback(null), 3000)
      return () => clearTimeout(t)
    }
  }, [feedback, router])

  function handleOpen() {
    setEntryType('credit'); setBillDate(today()); setParticulars('')
    setVoucherType(''); setVoucherNo(''); setAmount(''); setFeedback(null)
    setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const result = await addLedgerEntry({ dealerId, billDate, particulars, voucherType, voucherNo, entryType, amount })
      setFeedback(result.success
        ? { type: 'success', message: 'Entry added!' }
        : { type: 'error', message: result.error ?? 'Failed to save.' })
    })
  }

  const canSave = billDate && particulars.trim() && voucherType.trim() && voucherNo.trim() && parseFloat(amount) > 0

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Add ledger entry"
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#775a19] text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"
      >
        <Plus size={24} />
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-[#c6c6cd]/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f8f9ff] border border-[#c6c6cd]/40 active:scale-95 transition-transform">
              <X size={16} className="text-[#45464d]" />
            </button>
            <p className="text-[17px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>New Entry</p>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {feedback && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${feedback.type === 'success' ? 'bg-[#d6f5e3] text-[#1a5c34]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
                {feedback.message}
              </div>
            )}

            <div className="max-w-lg mx-auto flex flex-col gap-5">

              <div>
                <label className={labelCls}>Entry Type</label>
                <div className="flex gap-3">
                  {(['credit', 'debit'] as EntryType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setEntryType(type)}
                      className={`flex-1 h-12 rounded-xl text-[14px] font-semibold capitalize transition-all active:scale-95 ${
                        entryType === type
                          ? type === 'credit'
                            ? 'bg-[#ffdad6] text-[#93000a] border-2 border-[#ba1a1a]'
                            : 'bg-[#d6f5e3] text-[#1a5c34] border-2 border-[#2e7d50]'
                          : 'bg-[#f8f9ff] text-[#45464d] border border-[#c6c6cd]'
                      }`}
                    >
                      {type === 'credit' ? '📥 Credit (We Owe)' : '📤 Debit (We Pay)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Bill Date</label>
                <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Particulars</label>
                <input type="text" value={particulars} onChange={e => setParticulars(e.target.value)} placeholder="e.g. Fabric purchase — 50m shirting" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Voucher / Bill Type</label>
                  <input type="text" value={voucherType} onChange={e => setVoucherType(e.target.value)} placeholder="e.g. Purchase" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Voucher / Bill No</label>
                  <input type="text" value={voucherNo} onChange={e => setVoucherNo(e.target.value)} placeholder="e.g. INV-2025" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Amount (₹)</label>
                <input type="number" inputMode="decimal" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>

            </div>
          </div>

          <div className="px-5 py-4 border-t border-[#c6c6cd]/20 flex-shrink-0">
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleSave}
                disabled={isPending || !canSave}
                className="w-full h-12 bg-black text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : `Add ${entryType === 'credit' ? 'Credit' : 'Debit'} Entry`}
              </button>
            </div>
          </div>

        </div>,
        document.body,
      )}
    </>
  )
}
