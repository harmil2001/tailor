'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X, Loader2, CheckCircle2, AlertCircle, Pencil } from 'lucide-react'
import { updateFabric } from '@/app/(app)/inventory/actions'
import type { Fabric, FabricPattern } from '@/db/schema'
import FabricFormFields, { type FabricFormState } from './FabricFormFields'

function toForm(fabric: Fabric): FabricFormState {
  return {
    brand:                  fabric.brand,
    dealerName:             fabric.dealerName,
    color:                  fabric.color,
    pattern:                fabric.pattern,
    purchasePricePerMeter:  fabric.purchasePricePerMeter,
    sellingPriceFactor:     fabric.sellingPriceFactor,
    totalMeters:            fabric.totalMeters,
    availableMeters:        fabric.availableMeters,
  }
}

export default function EditFabricSheet({
  fabric,
  variant = 'button',
}: {
  fabric: Fabric
  variant?: 'button' | 'dark'
}) {
  const router = useRouter()
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState<FabricFormState>(toForm(fabric))
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

  function handleOpen() { setForm(toForm(fabric)); setFeedback(null); setOpen(true) }

  function handleSave() {
    start(async () => {
      const result = await updateFabric(fabric.id, { ...form, pattern: form.pattern as FabricPattern })
      setFeedback(result.success
        ? { type: 'success', message: 'Fabric updated!' }
        : { type: 'error', message: result.error ?? 'Something went wrong' })
    })
  }

  const canSave = !isPending && !!form.brand.trim() && !!form.dealerName.trim() &&
    !!form.color.trim() && !!form.pattern && Number(form.purchasePricePerMeter) > 0 &&
    Number(form.sellingPriceFactor) > 0 && Number(form.totalMeters) > 0 &&
    Number(form.availableMeters) >= 0 &&
    Number(form.availableMeters) <= Number(form.totalMeters)

  const btnCls = variant === 'dark'
    ? 'flex items-center gap-2 px-4 h-9 rounded-xl bg-white/15 border border-white/25 text-white text-[13px] font-semibold active:scale-95 transition-transform'
    : 'flex items-center gap-2 px-4 h-9 rounded-xl bg-canvas border border-line/40 text-ink text-[13px] font-semibold active:scale-95 transition-transform'

  return (
    <>
      <button onClick={handleOpen} className={btnCls}>
        <Pencil size={14} /> Edit
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform">
              <X size={16} className="text-ink-soft" />
            </button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>Edit Fabric</p>
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
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
