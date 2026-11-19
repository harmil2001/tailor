'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, CheckCircle2, AlertCircle, Search, ShoppingBag, ArrowRight } from 'lucide-react'
import { createOrder } from '@/app/(app)/orders/actions'
import OrderItemRow, { type OrderItemState } from './OrderItemRow'
import type { Fabric } from '@/db/schema'
import { whatsappNote } from '@/lib/whatsapp/notes'

type Customer = { id: string; name: string; phone: string }
type Feedback  = { type: 'success' | 'error'; message: string; slow?: boolean }

function today() { return new Date().toISOString().split('T')[0] }

const inputCls = 'w-full h-12 px-4 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-2'

export default function CreateOrderSheet({
  customers, fabrics, variant = 'button',
}: {
  customers: Customer[]
  fabrics: Fabric[]
  variant?: 'button' | 'fab' | 'inline' | 'card'
}) {
  const router                         = useRouter()
  const [mounted, setMounted]          = useState(false)
  const [open, setOpen]                = useState(false)
  const [selectedCustomer, setSelected]= useState<Customer | null>(null)
  const [searchQuery, setSearchQuery]  = useState('')
  const [showDropdown, setShowDropdown]= useState(false)
  const [noMatchToast, setNoMatch]     = useState(false)
  const [items, setItems]              = useState<OrderItemState[]>([{ name: '', clothProvidedBy: 'Customer', fabricType: null, fabricSelection: null, loosePieceNote: '' }])
  const [orderDate, setOrderDate]      = useState(today())
  const [total, setTotal]              = useState('')
  const [advance, setAdvance]          = useState('0')
  const [notes, setNotes]              = useState('')
  const [isPending, start]             = useTransition()
  const [feedback, setFeedback]        = useState<Feedback | null>(null)
  const searchRef                      = useRef<HTMLInputElement>(null)

  const filtered = searchQuery.trim()
    ? customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
    : []

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!feedback) return
    if (feedback.type === 'success') { const t = setTimeout(() => { setOpen(false); router.refresh() }, feedback.slow ? 4500 : 1200); return () => clearTimeout(t) }
    const t = setTimeout(() => setFeedback(null), 3000); return () => clearTimeout(t)
  }, [feedback, router])
  useEffect(() => {
    if (!noMatchToast) return
    const t = setTimeout(() => setNoMatch(false), 3000); return () => clearTimeout(t)
  }, [noMatchToast])

  function handleOpen() {
    setSelected(null); setSearchQuery(''); setShowDropdown(false)
    setItems([{ name: '', clothProvidedBy: 'Customer', fabricType: null, fabricSelection: null, loosePieceNote: '' }])
    setOrderDate(today()); setTotal(''); setAdvance('0'); setNotes(''); setFeedback(null); setNoMatch(false); setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const result = await createOrder({
        customerId: selectedCustomer!.id,
        items: items.map(it => ({
          name:            it.name,
          clothProvidedBy: it.clothProvidedBy,
          fabric: it.clothProvidedBy === 'Tailor' && it.fabricSelection && parseFloat(it.fabricSelection.metersUsed) > 0
            ? {
                fabricId:    it.fabricSelection.fabricId,
                brand:       it.fabricSelection.brand,
                color:       it.fabricSelection.color,
                metersUsed:  parseFloat(it.fabricSelection.metersUsed),
                pricePerMeter: it.fabricSelection.pricePerMeter,
                fabricTotal: parseFloat(it.fabricSelection.metersUsed) * it.fabricSelection.pricePerMeter,
              }
            : undefined,
        })),
        orderDate, totalAmount: total, advancePaid: advance,
        notes: notes.trim() || undefined,
      })
      const note = whatsappNote([result.whatsapp])
      setFeedback(result.success
        ? { type: 'success', message: note.text ? `Order created! ${note.text}` : 'Order created!', slow: note.needsAttention }
        : { type: 'error', message: result.error ?? 'Something went wrong' })
    })
  }

  const hasFabricError = items.some(it =>
    it.clothProvidedBy === 'Tailor' && it.fabricType === 'lot' && it.fabricSelection &&
    parseFloat(it.fabricSelection.metersUsed) > it.fabricSelection.availableMeters,
  )
  const hasLoosePieceError = items.some(it =>
    it.clothProvidedBy === 'Tailor' && it.fabricType === 'loose' && !it.loosePieceNote.trim(),
  )
  const canSave = !isPending && !!selectedCustomer && items.some(i => i.name.trim()) && !!orderDate && Number(total) > 0 && !hasFabricError && !hasLoosePieceError

  return (
    <>
      {variant === 'fab' ? (
        <button onClick={handleOpen} aria-label="New order" className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"><Plus size={26} /></button>
      ) : variant === 'inline' ? (
        <button onClick={handleOpen} className="h-12 px-6 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform"><Plus size={16} /> New Order</button>
      ) : variant === 'card' ? (
        <button onClick={handleOpen} className="w-full bg-brand-tint border border-brand-tint-strong/60 rounded-[20px] p-5 flex flex-col justify-between h-36 active:scale-[0.97] transition-transform text-left">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center"><ShoppingBag size={20} className="text-brand" /></div>
          <div>
            <p className="text-[17px] font-bold text-ink" style={{ fontFamily: 'Manrope' }}>New Order</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[12px] text-ink-soft">Create an order</p>
              <ArrowRight size={16} className="text-brand" />
            </div>
          </div>
        </button>
      ) : (
        <button onClick={handleOpen} className="w-full h-14 flex items-center justify-center gap-2 bg-brand text-white rounded-xl text-[16px] font-semibold active:scale-95 transition-transform"><Plus size={20} /> New Order</button>
      )}

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform"><X size={16} className="text-ink-soft" /></button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>New Order</p>
            <div className="w-9" />
          </div>

          {noMatchToast && (
            <div className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-danger-tint text-danger-ink text-[13px] font-medium flex-shrink-0">
              <AlertCircle size={16} className="flex-shrink-0" /> No customer found. Add them first from the Customers tab.
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {feedback && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${feedback.type === 'success' ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger-ink'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
                {feedback.message}
              </div>
            )}

            <div className="max-w-lg mx-auto flex flex-col gap-5">
              {/* Customer */}
              <div>
                <label className={labelCls}>Customer</label>
                {selectedCustomer ? (
                  <div className="flex items-center gap-3 h-14 px-4 bg-canvas border border-line rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">{selectedCustomer.name}</p>
                      <p className="text-[11px] text-ink-muted">{selectedCustomer.phone}</p>
                    </div>
                    <button onClick={() => { setSelected(null); setSearchQuery(''); setShowDropdown(false); setTimeout(() => searchRef.current?.focus(), 50) }} className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-tint flex-shrink-0"><X size={13} className="text-ink-soft" /></button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                    <input ref={searchRef} type="text" value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => { setTimeout(() => setShowDropdown(false), 150); if (searchQuery.trim() && filtered.length === 0) setNoMatch(true) }}
                      placeholder="Search by name or phone…"
                      className="w-full h-12 pl-10 pr-4 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors"
                    />
                    {showDropdown && searchQuery.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line/60 rounded-xl shadow-lg z-10 overflow-hidden">
                        {filtered.length > 0 ? filtered.slice(0, 6).map((c, i) => (
                          <button key={c.id} onMouseDown={() => { setSelected(c); setSearchQuery(''); setShowDropdown(false) }}
                            className={`w-full flex flex-col px-4 py-3 text-left active:bg-canvas ${i < filtered.length - 1 ? 'border-b border-line/20' : ''}`}>
                            <span className="text-[14px] font-medium text-ink">{c.name}</span>
                            <span className="text-[11px] text-ink-muted">{c.phone}</span>
                          </button>
                        )) : (
                          <div className="px-4 py-3 flex items-center gap-2 text-[13px] text-danger-ink"><AlertCircle size={14} /> No customer found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <label className={labelCls}>Items</label>
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <OrderItemRow key={idx} item={item} showRemove={items.length > 1} fabrics={fabrics}
                      onChange={updated => setItems(prev => prev.map((it, i) => i === idx ? updated : it))}
                      onRemove={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                    />
                  ))}
                  <button onClick={() => setItems(prev => [...prev, { name: '', clothProvidedBy: 'Customer', fabricType: null, fabricSelection: null, loosePieceNote: '' }])}
                    className="w-full h-11 rounded-xl border border-brand bg-white text-[13px] text-ink font-semibold active:scale-95 transition-transform">
                    + Add item
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Order Date</label>
                <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Total (₹)</label><input type="number" inputMode="numeric" value={total} onChange={e => setTotal(e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className={labelCls}>Advance (₹)</label><input type="number" inputMode="numeric" value={advance} onChange={e => setAdvance(e.target.value)} placeholder="0" className={inputCls} /></div>
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
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Order'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
