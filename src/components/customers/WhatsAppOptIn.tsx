'use client'

// "Customer agreed to WhatsApp updates" tick box. WhatsApp requires the customer's agreement
// before a business sends messages, so nothing is sent unless this is ticked.
// Only shown when the shop has WhatsApp switched on.
import { FEATURES } from '@/lib/features'

export default function WhatsAppOptIn({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  if (!FEATURES.whatsapp) return null
  return (
    <label className="flex items-start gap-3 p-4 bg-canvas border border-line rounded-xl cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 flex-shrink-0 accent-brand"
      />
      <span>
        <span className="block text-[14px] font-medium text-ink">Send WhatsApp updates</span>
        <span className="block text-[12px] text-ink-soft mt-0.5 leading-5">
          Tick only if the customer agreed to get order updates and receipts on WhatsApp.
        </span>
      </span>
    </label>
  )
}
