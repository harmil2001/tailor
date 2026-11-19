import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Order, Customer } from '@/db/schema'

interface RecentOrderCardProps {
  order: Order & { customer: Customer }
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-danger-tint/30 text-danger-ink',
  Stitching: 'bg-accent-tint/30 text-accent',
  Ready: 'bg-info-tint/30 text-ink',
  Delivered: 'bg-brand-tint text-ink-soft',
}

export default function RecentOrderCard({ order }: RecentOrderCardProps) {
  return (
    <Link href={`/order/${order.id}`}>
      <div className="bg-white p-5 rounded-[24px] shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-line/20 flex justify-between items-center active:scale-[0.98] transition-all">
        <div className="space-y-1">
          <p className="text-[18px] font-semibold text-ink" style={{ fontFamily: 'Manrope' }}>
            {order.customer.name}
          </p>
          <p className="text-[14px] text-ink-soft">{order.items.map(i => i.name).join(', ')}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusStyles[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>
        <ChevronRight size={20} className="text-line flex-shrink-0" />
      </div>
    </Link>
  )
}
