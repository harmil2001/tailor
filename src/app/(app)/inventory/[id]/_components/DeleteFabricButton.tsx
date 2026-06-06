'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteFabric } from '@/app/(app)/inventory/actions'

export default function DeleteFabricButton({ fabricId }: { fabricId: string }) {
  const router = useRouter()
  const [confirm, setConfirm]   = useState(false)
  const [isPending, start]      = useTransition()

  function handleDelete() {
    start(async () => {
      await deleteFabric(fabricId)
      router.push('/inventory')
      router.refresh()
    })
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-full h-12 rounded-xl border border-[#ba1a1a]/40 text-[#ba1a1a] text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <Trash2 size={16} /> Delete Fabric Entry
      </button>
    )
  }

  return (
    <div className="bg-white rounded-[20px] border border-[#ba1a1a]/30 p-5 flex flex-col gap-4">
      <div>
        <p className="text-[16px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
          Delete this fabric?
        </p>
        <p className="text-[13px] text-[#45464d] mt-1 leading-relaxed">
          This will permanently remove the fabric entry and its stock record. This cannot be undone.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 h-12 rounded-xl border border-[#c6c6cd] text-[14px] font-semibold text-[#45464d] active:scale-95 transition-transform"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 h-12 rounded-xl bg-[#ba1a1a] text-white text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete
        </button>
      </div>
    </div>
  )
}
