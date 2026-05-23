'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react'
import { createOrder } from '@/app/(app)/orders/actions'
import type { ClothProvidedBy } from '@/db/schema'

type Customer = { id: string; name: string; phone: string }
type Feedback = { type: 'success' | 'error'; message: string }

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function CreateOrderSheet({
  customers,
  variant = 'button',
}: {
  customers: Customer[]
  variant?: 'button' | 'fab' | 'inline'
}) {
  const router                              = useRouter()
  const [mounted, setMounted]               = useState(false)
  const [open, setOpen]                     = useState(false)
  const [selectedCustomer, setSelected]     = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery]       = useState('')
  const [showDropdown, setShowDropdown]     = useState(false)
  const [noMatchToast, setNoMatchToast]     = useState(false)
  const [items, setItems]                   = useState<{ name: string }[]>([{ name: '' }])
  const [clothBy, setClothBy]               = useState<ClothProvidedBy>('Customer')
  const [orderDate, setOrderDate]           = useState(today())
  const [total, setTotal]                   = useState('')
  const [advance, setAdvance]               = useState('0')
  const [notes, setNotes]                   = useState('')
  const [isPending, start]                  = useTransition()
  const [feedback, setFeedback]             = useState<Feedback | null>(null)
  const searchRef                           = useRef<HTMLInputElement>(null)

  const filtered = searchQuery.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery),
      )
    : []

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

  useEffect(() => {
    if (!noMatchToast) return
    const t = setTimeout(() => setNoMatchToast(false), 3000)
    return () => clearTimeout(t)
  }, [noMatchToast])

  function handleOpen() {
    setSelected(null); setSearchQuery(''); setShowDropdown(false)
    setItems([{ name: '' }]); setClothBy('Customer')
    setOrderDate(today()); setTotal(''); setAdvance('0'); setNotes('')
    setFeedback(null); setNoMatchToast(false); setOpen(true)
  }

  function handleSearchBlur() {
    setTimeout(() => setShowDropdown(false), 150)
    if (searchQuery.trim() && filtered.length === 0) setNoMatchToast(true)
  }

  function selectCustomer(c: Customer) {
    setSelected(c); setSearchQuery(''); setShowDropdown(false)
  }

  function clearCustomer() {
    setSelected(null); setSearchQuery(''); setShowDropdown(false)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function handleSave() {
    start(async () => {
      const result = await createOrder({
        customerId: selectedCustomer!.id,
        items, clothProvidedBy: clothBy, orderDate,
        totalAmount: total, advancePaid: advance,
        notes: notes.trim() || undefined,
      })
      setFeedback(result.success
        ? { type: 'success', message: 'Order created!' }
        : { type: 'error', message: result.error ?? 'Something went wrong' })
    })
  }

  const canSave = !isPending && !!selectedCustomer && items.some(i => i.name.trim()) && !!orderDate && Number(total) > 0

  const inputCls = 'w-full h-12 px-4 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors'
  const labelCls = 'block text-[11px] font-semibold tracking-widest text-[#45464d] uppercase mb-2'

  return (
    <>
      {variant === 'fab' ? (
        <button onClick={handleOpen} aria-label="New order" className="fixed bottom-24 right-6 w-14 h-14 bg-[#775a19] text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40">
          <Plus size={26} />
        </button>
      ) : variant === 'inline' ? (
        <button onClick={handleOpen} className="h-12 px-6 bg-black text-white rounded-xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform">
          <Plus size={16} /> New Order
        </button>
      ) : (
        <button onClick={handleOpen} className="w-full h-14 flex items-center justify-center gap-2 bg-black text-white rounded-xl text-[16px] font-semibold active:scale-95 transition-transform">
          <Plus size={20} /> New Order
        </button>
      )}

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-[#c6c6cd]/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f8f9ff] border border-[#c6c6cd]/40 active:scale-95 transition-transform">
              <X size={16} className="text-[#45464d]" />
            </button>
            <p className="text-[17px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>New Order</p>
            <div className="w-9" />
          </div>

          {/* No-match toast */}
          {noMatchToast && (
            <div className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-[13px] font-medium flex-shrink-0">
              <AlertCircle size={16} className="flex-shrink-0" />
              No customer found. Add them first from the Customers tab.
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {feedback && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${feedback.type === 'success' ? 'bg-[#d6f5e3] text-[#1a5c34]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
                {feedback.message}
              </div>
            )}

            <div className="max-w-lg mx-auto flex flex-col gap-5">

              {/* Customer search */}
              <div>
                <label className={labelCls}>Customer</label>
                {selectedCustomer ? (
                  <div className="flex items-center gap-3 h-14 px-4 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#0b1c30] truncate">{selectedCustomer.name}</p>
                      <p className="text-[11px] text-[#76777d]">{selectedCustomer.phone}</p>
                    </div>
                    <button onClick={clearCustomer} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#e5e5ea] flex-shrink-0">
                      <X size={13} className="text-[#45464d]" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={handleSearchBlur}
                      placeholder="Search by name or phone…"
                      className="w-full h-12 pl-10 pr-4 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors"
                    />
                    {showDropdown && searchQuery.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#c6c6cd]/60 rounded-xl shadow-lg z-10 overflow-hidden">
                        {filtered.length > 0 ? filtered.slice(0, 6).map((c, i) => (
                          <button
                            key={c.id}
                            onMouseDown={() => selectCustomer(c)}
                            className={`w-full flex flex-col px-4 py-3 text-left active:bg-[#f8f9ff] ${i < filtered.length - 1 ? 'border-b border-[#c6c6cd]/20' : ''}`}
                          >
                            <span className="text-[14px] font-medium text-[#0b1c30]">{c.name}</span>
                            <span className="text-[11px] text-[#76777d]">{c.phone}</span>
                          </button>
                        )) : (
                          <div className="px-4 py-3 flex items-center gap-2 text-[13px] text-[#93000a]">
                            <AlertCircle size={14} /> No customer found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className={inputCls} />
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
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Order'}
              </button>
            </div>
          </div>

        </div>,
        document.body
      )}
    </>
  )
}
