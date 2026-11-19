import { notFound } from 'next/navigation'
import { FEATURES } from '@/lib/features'

// Guards every /inventory page: while the module is switched off they show "not found".
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.stock) notFound()
  return children
}
