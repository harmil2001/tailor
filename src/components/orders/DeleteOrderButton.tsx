'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteOrder } from '@/app/(app)/orders/actions'

export default function DeleteOrderButton({ orderId, customerName }: { orderId: string; customerName: string }) {
  const router = useRouter()
  const [mounted, setMounted]     = useState(false)
  const [confirm, setConfirm]     = useState(false)
  const [isPending, start]        = useTransition()

  useEffect(() => { setMounted(true) }, [])

  function handleDelete() {
    start(async () => {
      const result = await deleteOrder(orderId)
      if (result.success) {
        setConfirm(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <button
        onClick={e => { e.preventDefault(); setConfirm(true) }}
        aria-label="Delete order"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-line/60 shadow-sm active:scale-95 transition-transform"
      >
        <Trash2 size={15} className="text-danger" />
      </button>

      {mounted && confirm && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-6">
          <div className="w-full max-w-sm bg-white rounded-[24px] p-6 flex flex-col gap-4 shadow-xl">
            <div>
              <p className="text-[17px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                Delete this order?
              </p>
              <p className="text-[13px] text-ink-soft mt-2 leading-relaxed">
                Order for <span className="font-semibold text-ink">{customerName}</span> will be permanently deleted. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                disabled={isPending}
                className="flex-1 h-12 rounded-xl border border-line text-[14px] font-semibold text-ink-soft active:scale-95 transition-transform disabled:opacity-50"
              >
                Keep
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 h-12 rounded-xl bg-danger text-white text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isPending ? <><Loader2 size={15} className="animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
