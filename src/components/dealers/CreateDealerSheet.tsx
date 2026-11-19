'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Store, X, Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { createDealer } from '@/app/(app)/dealers/actions'

type Feedback = { type: 'success' | 'error'; message: string }

const inputCls = 'w-full h-12 px-4 bg-canvas border border-line rounded-xl text-[14px] text-ink focus:outline-none focus:border-brand transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-2'

interface Props {
  variant?: 'fab' | 'inline'
  initialName?: string
}

export default function CreateDealerSheet({ variant = 'fab', initialName = '' }: Props) {
  const router = useRouter()
  const [mounted, setMounted]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [name, setName]         = useState(initialName)
  const [isPending, start]      = useTransition()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

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
    setName(initialName)
    setFeedback(null)
    setOpen(true)
  }

  function handleSave() {
    start(async () => {
      const result = await createDealer(name)
      if (result.success && result.dealerId) {
        setFeedback({ type: 'success', message: 'Dealer added!' })
        setTimeout(() => router.push(`/dealers/${result.dealerId}`), 800)
      } else {
        setFeedback({ type: 'error', message: result.error ?? 'Failed to add dealer.' })
      }
    })
  }

  return (
    <>
      {variant === 'fab' ? (
        <button
          onClick={handleOpen}
          aria-label="Add dealer"
          className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"
        >
          <Plus size={24} />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="h-12 px-5 bg-accent text-white rounded-xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Store size={16} /> Add &ldquo;{initialName}&rdquo;
        </button>
      )}

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-line/30 flex-shrink-0">
            <button onClick={() => !isPending && setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas border border-line/40 active:scale-95 transition-transform">
              <X size={16} className="text-ink-soft" />
            </button>
            <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>New Dealer</p>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {feedback && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium mb-5 ${feedback.type === 'success' ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger-ink'}`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
                {feedback.message}
              </div>
            )}

            <div className="max-w-lg mx-auto">
              <label className={labelCls}>Dealer / Firm Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Hemal & Co."
                className={inputCls}
                autoFocus
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t border-line/20 flex-shrink-0">
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleSave}
                disabled={isPending || !name.trim()}
                className="w-full h-12 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Add Dealer'}
              </button>
            </div>
          </div>

        </div>,
        document.body,
      )}
    </>
  )
}
