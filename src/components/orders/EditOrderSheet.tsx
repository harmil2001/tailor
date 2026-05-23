'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Pencil, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateOrder } from '@/app/(app)/orders/actions'
import type { Order, Customer, OrderStatus, ClothProvidedBy } from '@/db/schema'

type Feedback = { type: 'success' | 'error'; message: string }

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Stitching', 'Ready', 'Delivered', 'Cancelled']

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:   'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]',
  Stitching: 'bg-[#fed488] text-[#785a1a] border-[#fed488]',
  Ready:     'bg-[#d3e4fe] text-[#0040a0] border-[#d3e4fe]',
  Delivered: 'bg-[#dce9ff] text-[#45464d] border-[#dce9ff]',
  Cancelled: 'bg-[#e5e5ea] text-[#45464d] border-[#e5e5ea]',
}

const inputCls = 'w-full h-12 px-4 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-[#45464d] uppercase mb-2'

export default function EditOrderSheet({ order }: { order: Order & { customer: Customer } }) {
  const router = useRouter()
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [status, setStatus]     = useState<OrderStatus>(order.status)
  const [items, setItems]       = useState<{ name: string }[]>(order.items.length ? order.items : [{ name: '' }])
  const [clothBy, setClothBy]   = useState<ClothProvidedBy>(order.clothProvidedBy)
  const [orderDate, setDate]    = useState(order.orderDate)
  const [total, setTotal]       = useState(order.totalAmount)
  const [advance, setAdvance]   = useState(order.advancePaid)
  const [notes, setNotes]       = useState(order.notes ?? '')
  const [isPending, start]        = useTransition()
  const [feedback, setFeedback]   = useState<Feedback | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!feedback) return
    if (feedback.type === 'success') {
      const t = setTimeout(() => { setOpen(false); router.refresh() }, 1200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setFeedback(null), 3000)
    return () => clearTimeout(t)
  }, [feedback, router])

  function handleOpen() {
    setStatus(order.status); setItems(order.items.length ? order.items : [{ name: '' }]); setClothBy(order.clothProvidedBy)
    setDate(order.orderDate); setTotal(order.totalAmount); setAdvance(order.advancePaid)
    setNotes(order.notes ?? ''); setFeedback(null); setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const result = await updateOrder(order.id, {
        status, items, clothProvidedBy: clothBy, orderDate,
        totalAmount: total, advancePaid: advance,
        notes: notes.trim() || undefined,
      })
      setFeedback(result.success
        ? { type: 'success', message: 'Order updated!' }
        : { type: 'error', message: result.error ?? 'Something went wrong' })
    })
  }

  const canSave = !isPending && items.some(i => i.name.trim()) && !!orderDate &&
    (status === 'Cancelled' || Number(total) > 0)

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#c6c6cd]/60 shadow-sm active:scale-95 transition-transform"
        aria-label="Edit order"
      >
        <Pencil size={15} className="text-[#45464d]" />
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-[#c6c6cd]/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f8f9ff] border border-[#c6c6cd]/40 active:scale-95 transition-transform">
              <X size={16} className="text-[#45464d]" />
            </button>
            <p className="text-[17px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>Edit Order</p>
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

              {/* Customer — read-only */}
              <div>
                <label className={labelCls}>Customer</label>
                <div className="h-12 px-4 bg-[#f8f9ff] border border-[#c6c6cd]/60 rounded-xl flex items-center">
                  <span className="text-[14px] text-[#76777d]">{order.customer.name}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => s === 'Cancelled' && status !== 'Cancelled' ? setConfirmCancel(true) : setStatus(s)}
                      className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                        status === s
                          ? STATUS_COLORS[s]
                          : 'bg-white border-[#c6c6cd] text-[#45464d]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Items</label>
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { name: e.target.value } : it))}
                        placeholder="e.g. Kurta, Suit, Shirt…"
                        className={`${inputCls} flex-1`}
                      />
                      {items.length > 1 && (
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#ffdad6] text-[#93000a] flex-shrink-0">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setItems(prev => [...prev, { name: '' }])} className="h-11 rounded-xl border border-dashed border-[#c6c6cd] text-[13px] text-[#45464d] font-medium active:scale-95 transition-transform">
                    + Add item
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Cloth provided by</label>
                <div className="flex gap-2">
                  {(['Customer', 'Tailor'] as const).map(opt => (
                    <button key={opt} onClick={() => setClothBy(opt)} className={`flex-1 h-11 rounded-xl text-[13px] font-semibold transition-colors ${clothBy === opt ? 'bg-black text-white' : 'bg-[#f8f9ff] border border-[#c6c6cd] text-[#45464d]'}`}>{opt}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Order Date</label>
                <input type="date" value={orderDate} onChange={e => setDate(e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Total (₹)</label>
                  <input type="number" inputMode="numeric" value={total} onChange={e => setTotal(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Advance (₹)</label>
                  <input type="number" inputMode="numeric" value={advance} onChange={e => setAdvance(e.target.value)} placeholder="0" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes <span className="normal-case tracking-normal font-normal text-[#76777d]">(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions…" rows={3} className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors resize-none" />
              </div>

            </div>
          </div>

          <div className="px-5 py-4 border-t border-[#c6c6cd]/20 flex-shrink-0">
            <div className="max-w-lg mx-auto">
              <button onClick={handleSave} disabled={!canSave} className="w-full h-12 bg-black text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Cancel confirmation dialog */}
          {confirmCancel && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 px-6">
              <div className="w-full max-w-sm bg-white rounded-[24px] p-6 flex flex-col gap-4">
                <div>
                  <p className="text-[17px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Cancel this order?
                  </p>
                  <p className="text-[13px] text-[#45464d] mt-2 leading-relaxed">
                    Since the order is being cancelled, the total and advance amounts will be reset to ₹0. You can update them manually if needed.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 h-12 rounded-xl border border-[#c6c6cd] text-[14px] font-semibold text-[#45464d] active:scale-95 transition-transform"
                  >
                    Keep
                  </button>
                  <button
                    onClick={() => { setStatus('Cancelled'); setTotal('0'); setAdvance('0'); setConfirmCancel(false) }}
                    className="flex-1 h-12 rounded-xl bg-[#93000a] text-white text-[14px] font-semibold active:scale-95 transition-transform"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>,
        document.body
      )}
    </>
  )
}
