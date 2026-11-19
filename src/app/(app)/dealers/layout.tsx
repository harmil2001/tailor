import { notFound } from 'next/navigation'
import { FEATURES } from '@/lib/features'

// Guards every /dealers page: while the module is switched off they show "not found".
export default function DealersLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.dealers) notFound()
  return children
}
