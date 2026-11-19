'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Customer } from '@/db/schema'
import { updateCustomer } from '../actions'
import { FEATURES } from '@/lib/features'
import WhatsAppOptIn from '@/components/customers/WhatsAppOptIn'

const MEASUREMENT_KEYS = ['chest', 'waist', 'shoulder', 'shirtLength', 'trouser', 'inseam']
const MEASUREMENT_LABELS: Record<string, string> = {
  chest: 'Chest', waist: 'Waist', shoulder: 'Shoulder',
  shirtLength: 'Shirt Length', trouser: 'Trouser', inseam: 'Inseam',
}

type Feedback = { type: 'success' | 'error'; message: string }

const inputCls = 'w-full h-12 px-4 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-2'

export default function EditCustomerSheet({ customer, variant = 'light' }: { customer: Customer; variant?: 'light' | 'dark' }) {
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [name, setName]         = useState(customer.name)
  const [phone, setPhone]       = useState(customer.phone)
  const [optIn, setOptIn]       = useState(customer.whatsappOptIn)
  const [isPending, start]      = useTransition()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const existing = (customer.measurements ?? {}) as Record<string, string>
  const [meas, setMeas] = useState<Record<string, string>>(
    Object.fromEntries(MEASUREMENT_KEYS.map(k => [k, existing[k] ?? ''])),
  )

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!feedback) return
    if (feedback.type === 'success') {
      const t = setTimeout(() => setOpen(false), 1200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setFeedback(null), 3000)
    return () => clearTimeout(t)
  }, [feedback])

  function handleOpen() {
    setName(customer.name); setPhone(customer.phone); setOptIn(customer.whatsappOptIn)
    setMeas(Object.fromEntries(MEASUREMENT_KEYS.map(k => [k, existing[k] ?? ''])))
    setFeedback(null); setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const result = await updateCustomer(customer.id, {
        name, phone,
        measurements: Object.fromEntries(Object.entries(meas).filter(([, v]) => v.trim() !== '')),
        whatsappOptIn: FEATURES.whatsapp ? optIn : undefined,
      })
      setFeedback(result.error
        ? { type: 'error', message: result.error }
        : { type: 'success', message: 'Customer updated successfully' })
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-transform flex-shrink-0 ${variant === 'dark' ? 'bg-white/15 border border-white/20' : 'bg-canvas border border-line/40'}`}
        aria-label="Edit customer"
      >
        <Pencil size={16} className={variant === 'dark' ? 'text-white' : 'text-ink-soft'} />
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform">
              <X size={16} className="text-ink-soft" />
            </button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>Edit Customer</p>
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

              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Mobile Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" className={inputCls} />
              </div>

              <WhatsAppOptIn checked={optIn} onChange={setOptIn} />

              <div>
                <label className={labelCls}>Measurements <span className="normal-case tracking-normal font-normal text-ink-muted">(inches)</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {MEASUREMENT_KEYS.map(key => (
                    <div key={key}>
                      <p className="text-[11px] text-ink-muted mb-1">{MEASUREMENT_LABELS[key]}</p>
                      <input type="number" inputMode="decimal" value={meas[key]} onChange={e => setMeas(prev => ({ ...prev, [key]: e.target.value }))} placeholder="—" className="w-full h-11 px-3 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="px-5 py-4 border-t border-line/20 flex-shrink-0">
            <div className="max-w-lg mx-auto">
              <button onClick={handleSave} disabled={isPending || !name.trim() || !phone.trim()} className="w-full h-12 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>

        </div>,
        document.body
      )}
    </>
  )
}
