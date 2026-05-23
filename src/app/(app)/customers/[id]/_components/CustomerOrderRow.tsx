import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Order } from '@/db/schema'

const statusStyles: Record<string, string> = {
  Pending:   'bg-[#ffdad6] text-[#93000a]',
  Stitching: 'bg-[#fed488] text-[#785a1a]',
  Ready:     'bg-[#d3e4fe] text-[#000000]',
  Delivered: 'bg-[#dce9ff] text-[#45464d]',
}

export default function CustomerOrderRow({ order }: { order: Order }) {
  const balance  = parseFloat(order.totalAmount) - parseFloat(order.advancePaid)
  const isPaid   = balance === 0
  const date     = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link href={`/order/${order.id}`}>
      <div className="flex items-center justify-between py-3.5 border-b border-[#c6c6cd]/30 last:border-0 active:bg-[#f8f9ff] -mx-5 px-5 transition-colors">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[#0b1c30]">{order.items.map(i => i.name).join(', ')}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[order.status]}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[12px] text-[#76777d]">{date}</p>
            <p className={`text-[12px] font-semibold ${isPaid ? 'text-[#45464d]' : 'text-[#ba1a1a]'}`}>
              {isPaid ? 'Paid ✓' : `₹${balance.toLocaleString('en-IN')} due`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="text-[14px] font-bold text-[#0b1c30]">
            ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
          </p>
          <ChevronRight size={16} className="text-[#c6c6cd]" />
        </div>
      </div>
    </Link>
  )
}
