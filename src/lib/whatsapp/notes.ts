// Turns WhatsApp results into the short note shown on the order forms. Safe for client components.
import type { WhatsAppResult } from './send'

export function whatsappNote(results: (WhatsAppResult | undefined)[] | undefined): { text: string; needsAttention: boolean } {
  const list = (results ?? []).filter((r): r is WhatsAppResult => !!r && r.outcome !== 'disabled')
  if (list.length === 0) return { text: '', needsAttention: false }
  const text = [...new Set(list.map(r => r.message))].join(' · ')
  return { text, needsAttention: list.some(r => r.outcome !== 'sent') }
}
