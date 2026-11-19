'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateOrder } from '@/app/(app)/orders/actions'
import type { Order, Customer, OrderStatus, ClothProvidedBy } from '@/db/schema'
import { FEATURES } from '@/lib/features'
import { whatsappNote } from '@/lib/whatsapp/notes'

type OrderItem = { name: string; clothProvidedBy: ClothProvidedBy }

type Feedback = { type: 'success' | 'error'; message: string; slow?: boolean }

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Stitching', 'Ready', 'Delivered', 'Cancelled']

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:   'bg-danger-tint text-danger-ink border-danger-tint',
  Stitching: 'bg-accent-tint text-accent-ink border-accent-tint',
  Ready:     'bg-info-tint text-info-ink border-info-tint',
  Delivered: 'bg-brand-tint text-ink-soft border-brand-tint',
  Cancelled: 'bg-neutral-tint text-ink-soft border-neutral-tint',
}

const inputCls = 'w-full h-12 px-4 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-2'

export default function EditOrderSheet({ order, triggerOpen, onClose }: {
  order: Order & { customer: Customer }
  triggerOpen?: boolean
  onClose?: () => void
}) {
  const router = useRouter()
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [status, setStatus]     = useState<OrderStatus>(order.status)
  const [items, setItems]       = useState<OrderItem[]>(order.items.length ? order.items as OrderItem[] : [{ name: '', clothProvidedBy: 'Customer' }])
  const [orderDate, setDate]    = useState(order.orderDate)
  const [total, setTotal]       = useState(order.totalAmount)
  const [advance, setAdvance]   = useState(order.advancePaid)
  const [notes, setNotes]       = useState(order.notes ?? '')
  const [isPending, start]        = useTransition()
  const [feedback, setFeedback]   = useState<Feedback | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (triggerOpen) handleOpen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerOpen])

  useEffect(() => {
    if (!feedback) return
    if (feedback.type === 'success') {
      const t = setTimeout(() => { setOpen(false); router.refresh() }, feedback.slow ? 4500 : 1200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setFeedback(null), 3000)
    return () => clearTimeout(t)
  }, [feedback, router])

  function handleOpen() {
    setStatus(order.status); setItems(order.items.length ? order.items as OrderItem[] : [{ name: '', clothProvidedBy: 'Customer' }])
    setDate(order.orderDate); setTotal(order.totalAmount); setAdvance(order.advancePaid)
    setNotes(order.notes ?? ''); setFeedback(null); setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const result = await updateOrder(order.id, {
        status, items, orderDate,
        totalAmount: total, advancePaid: advance,
        notes: notes.trim() || undefined,
      })
      const note = whatsappNote(result.whatsapp)
      setFeedback(result.success
        ? { type: 'success', message: note.text ? `Order updated! ${note.text}` : 'Order updated!', slow: note.needsAttention }
        : { type: 'error', message: result.error ?? 'Something went wrong' })
    })
  }

  const canSave = !isPending && items.some(i => i.name.trim()) && !!orderDate &&
    (status === 'Cancelled' || Number(total) > 0)

  return (
    <>
      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => { if (!isPending) { setOpen(false); onClose?.() } }} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform">
              <X size={16} className="text-ink-soft" />
            </button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>Edit Order</p>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {feedback && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${feedback.type === 'success' ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger-ink'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
                {feedback.message}
              </div>
            )}

            <div className="max-w-lg mx-auto flex flex-col gap-5">

              {/* Customer — read-only */}
              <div>
                <label className={labelCls}>Customer</label>
                <div className="h-12 px-4 bg-canvas border border-line/60 rounded-xl flex items-center">
                  <span className="text-[14px] text-ink-muted">{order.customer.name}</span>
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
                          : 'bg-white border-line text-ink-soft'
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
                    <div key={idx} className="flex flex-col gap-2 p-3 bg-canvas border border-line rounded-xl">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))}
                          placeholder="e.g. Kurta, Suit, Shirt…"
                          className="flex-1 h-11 px-3 bg-white border border-line rounded-lg text-[14px] text-ink focus:outline-none focus:border-brand transition-colors"
                        />
                        {items.length > 1 && (
                          <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="w-11 h-11 flex items-center justify-center rounded-lg bg-danger-tint text-danger-ink flex-shrink-0">
                            <X size={15} />
                          </button>
                        )}
                      </div>
                      {FEATURES.clothChoice && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">Cloth</span>
                          <div className="flex gap-1.5">
                            {(['Customer', 'Tailor'] as const).map(opt => (
                              <button key={opt} onClick={() => setItems(prev => prev.map((it, i) => i === idx ? { ...it, clothProvidedBy: opt } : it))}
                                className={`px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors ${item.clothProvidedBy === opt ? 'bg-brand text-white' : 'bg-white border border-line text-ink-soft'}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setItems(prev => [...prev, { name: '', clothProvidedBy: 'Customer' }])} className="w-full h-11 rounded-xl border border-brand bg-white text-[13px] text-ink font-semibold active:scale-95 transition-transform">
                    + Add item
                  </button>
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
                <label className={labelCls}>Notes <span className="normal-case tracking-normal font-normal text-ink-muted">(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions…" rows={3} className="w-full px-4 py-3 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors resize-none" />
              </div>

            </div>
          </div>

          <div className="px-5 py-4 border-t border-line/20 flex-shrink-0">
            <div className="max-w-lg mx-auto">
              <button onClick={handleSave} disabled={!canSave} className="w-full h-12 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Cancel confirmation dialog */}
          {confirmCancel && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 px-6">
              <div className="w-full max-w-sm bg-white rounded-[24px] p-6 flex flex-col gap-4">
                <div>
                  <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Cancel this order?
                  </p>
                  <p className="text-[13px] text-ink-soft mt-2 leading-relaxed">
                    Since the order is being cancelled, the total and advance amounts will be reset to ₹0. You can update them manually if needed.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 h-12 rounded-xl border border-line text-[14px] font-semibold text-ink-soft active:scale-95 transition-transform"
                  >
                    Keep
                  </button>
                  <button
                    onClick={() => { setStatus('Cancelled'); setTotal('0'); setAdvance('0'); setConfirmCancel(false) }}
                    className="flex-1 h-12 rounded-xl bg-danger-ink text-white text-[14px] font-semibold active:scale-95 transition-transform"
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
