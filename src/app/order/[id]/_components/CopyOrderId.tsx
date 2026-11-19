'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyOrderId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-4 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">
          Order ID
        </span>
        <span className="text-[13px] text-ink font-mono truncate">
          {id}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-canvas border border-line/60 active:scale-90 transition-all"
        aria-label="Copy order ID"
      >
        {copied
          ? <Check size={16} className="text-accent" />
          : <Copy size={16} className="text-ink-soft" />
        }
      </button>
    </div>
  )
}
