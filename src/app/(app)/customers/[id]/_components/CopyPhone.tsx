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
    <div className="flex items-center justify-between h-14 px-4 bg-white rounded-2xl border border-[#c6c6cd]/40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#e5eeff] flex items-center justify-center">
          <Phone size={15} className="text-[#45464d]" />
        </div>
        <p className="text-[14px] font-semibold text-[#0b1c30]">{phone}</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
        style={{ background: copied ? '#d6f5e3' : '#f8f9ff', color: copied ? '#1a5c34' : '#45464d' }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
