'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, CheckCircle2, AlertCircle, Package, ArrowRight } from 'lucide-react'
import { createFabric } from '@/app/(app)/inventory/actions'
import type { FabricPattern } from '@/db/schema'
import FabricFormFields, { type FabricFormState } from './FabricFormFields'

const EMPTY: FabricFormState = {
  brand: '', dealerName: '', color: '', pattern: 'Plain',
  purchasePricePerMeter: '', sellingPriceFactor: '1',
  totalMeters: '', availableMeters: '',
}

export default function CreateFabricSheet({ variant = 'fab' }: { variant?: 'fab' | 'inline' | 'card' }) {
  const router = useRouter()
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState<FabricFormState>(EMPTY)
  const [isPending, start]      = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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

  function handleOpen() { setForm(EMPTY); setFeedback(null); setOpen(true) }

  function handleSave() {
    start(async () => {
      const result = await createFabric({ ...form, pattern: form.pattern as FabricPattern })
      setFeedback(result.success
        ? { type: 'success', message: 'Fabric added to inventory!' }
        : { type: 'error', message: result.error ?? 'Something went wrong' })
    })
  }

  const canSave = !isPending && !!form.brand.trim() && !!form.dealerName.trim() &&
    !!form.color.trim() && !!form.pattern && Number(form.purchasePricePerMeter) > 0 &&
    Number(form.sellingPriceFactor) > 0 && Number(form.totalMeters) > 0 &&
    Number(form.availableMeters) >= 0 &&
    Number(form.availableMeters) <= Number(form.totalMeters)

  return (
    <>
      {variant === 'fab' ? (
        <button onClick={handleOpen} aria-label="Add fabric" className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40">
          <Plus size={26} />
        </button>
      ) : variant === 'card' ? (
        <button onClick={handleOpen} className="w-full bg-brand rounded-[20px] p-5 flex flex-col justify-between h-36 active:scale-[0.97] transition-transform text-left">
          <div className="w-10 h-10 rounded-xl bg-accent-soft/20 flex items-center justify-center">
            <Package size={20} className="text-accent-soft" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-white" style={{ fontFamily: 'Manrope' }}>Add Fabric</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[12px] text-white/50">Add to stock</p>
              <ArrowRight size={16} className="text-accent-soft" />
            </div>
          </div>
        </button>
      ) : (
        <button onClick={handleOpen} className="h-12 px-6 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform">
          <Plus size={16} /> Add Fabric
        </button>
      )}

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform">
              <X size={16} className="text-ink-soft" />
            </button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>Add Fabric</p>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {feedback && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${feedback.type === 'success' ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger-ink'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
                {feedback.message}
              </div>
            )}
            <FabricFormFields form={form} onChange={setForm} />
          </div>

          <div className="px-5 py-4 border-t border-line/20 flex-shrink-0">
            <button onClick={handleSave} disabled={!canSave} className="w-full h-12 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Adding…</> : 'Add to Inventory'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
