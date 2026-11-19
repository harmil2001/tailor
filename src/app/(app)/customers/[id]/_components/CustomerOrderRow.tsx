import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Order } from '@/db/schema'

const statusStyles: Record<string, string> = {
  Pending:   'bg-danger-tint text-danger-ink',
  Stitching: 'bg-accent-tint text-accent-ink',
  Ready:     'bg-info-tint text-ink',
  Delivered: 'bg-brand-tint text-ink-soft',
}

export default function CustomerOrderRow({ order }: { order: Order }) {
  const balance  = parseFloat(order.totalAmount) - parseFloat(order.advancePaid)
  const isPaid   = balance === 0
  const date     = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link href={`/order/${order.id}`}>
      <div className="flex items-center justify-between py-3.5 border-b border-line/30 last:border-0 active:bg-canvas -mx-5 px-5 transition-colors">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-ink">{order.items.map(i => i.name).join(', ')}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[order.status]}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[12px] text-ink-muted">{date}</p>
            <p className={`text-[12px] font-semibold ${isPaid ? 'text-ink-soft' : 'text-danger'}`}>
              {isPaid ? 'Paid ✓' : `₹${balance.toLocaleString('en-IN')} due`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="text-[14px] font-bold text-ink">
            ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
          </p>
          <ChevronRight size={16} className="text-line" />
        </div>
      </div>
    </Link>
  )
}
