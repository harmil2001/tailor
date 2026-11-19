'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { UserPlus, X, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { createCustomer } from '@/app/(app)/customers/actions'

const MEASUREMENT_KEYS = ['chest', 'waist', 'shoulder', 'shirtLength', 'trouser', 'inseam']
const MEASUREMENT_LABELS: Record<string, string> = {
  chest: 'Chest', waist: 'Waist', shoulder: 'Shoulder',
  shirtLength: 'Shirt Length', trouser: 'Trouser', inseam: 'Inseam',
}

type Feedback = { type: 'success' | 'error'; message: string }

const inputCls = 'w-full h-12 px-4 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-2'

export default function CreateCustomerSheet({ variant = 'button' }: { variant?: 'button' | 'fab' | 'inline' | 'card' }) {
  const router = useRouter()
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [isPending, start]      = useTransition()
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [meas, setMeas]         = useState<Record<string, string>>(
    Object.fromEntries(MEASUREMENT_KEYS.map(k => [k, ''])),
  )

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
    setName(''); setPhone('')
    setMeas(Object.fromEntries(MEASUREMENT_KEYS.map(k => [k, ''])))
    setFeedback(null); setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const measurements = Object.fromEntries(Object.entries(meas).filter(([, v]) => v.trim() !== ''))
      const result = await createCustomer({ name, phone, measurements })
      setFeedback(result.error
        ? { type: 'error', message: result.error }
        : { type: 'success', message: 'Customer created successfully!' })
    })
  }

  return (
    <>
      {variant === 'fab' ? (
        <button onClick={handleOpen} aria-label="Add customer" className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40">
          <UserPlus size={24} />
        </button>
      ) : variant === 'inline' ? (
        <button onClick={handleOpen} className="h-12 px-6 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform">
          <UserPlus size={16} /> Add Customer
        </button>
      ) : variant === 'card' ? (
        <button onClick={handleOpen} className="w-full bg-white border border-line rounded-[20px] p-5 flex flex-col justify-between h-36 active:scale-[0.97] transition-transform text-left">
          <div className="w-10 h-10 rounded-xl bg-accent-tint flex items-center justify-center">
            <UserPlus size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-ink" style={{ fontFamily: 'Manrope' }}>New Customer</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[12px] text-ink-muted">Add to your shop</p>
              <ArrowRight size={16} className="text-accent" />
            </div>
          </div>
        </button>
      ) : (
        <button onClick={handleOpen} className="w-full h-14 flex items-center justify-center gap-2 bg-white border-2 border-accent text-accent rounded-xl text-[16px] font-semibold active:scale-95 transition-transform">
          <UserPlus size={20} /> Add Customer
        </button>
      )}

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform">
              <X size={16} className="text-ink-soft" />
            </button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>New Customer</p>
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

              <div>
                <label className={labelCls}>Measurements <span className="normal-case tracking-normal font-normal text-ink-muted">(inches, optional)</span></label>
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
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Customer'}
              </button>
            </div>
          </div>

        </div>,
        document.body
      )}
    </>
  )
}
