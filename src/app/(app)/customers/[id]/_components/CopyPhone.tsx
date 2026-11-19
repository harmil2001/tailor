'use client'

import { useState } from 'react'
import { Phone, Copy, Check } from 'lucide-react'

export default function CopyPhone({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-white rounded-2xl border border-line/40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-tint flex items-center justify-center">
          <Phone size={15} className="text-ink-soft" />
        </div>
        <p className="text-[14px] font-semibold text-ink">{phone}</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
        style={{ background: copied ? 'var(--color-success-tint)' : 'var(--color-canvas)', color: copied ? 'var(--color-success)' : 'var(--color-ink-soft)' }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
