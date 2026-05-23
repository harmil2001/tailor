import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Order, Customer } from '@/db/schema'

interface RecentOrderCardProps {
  order: Order & { customer: Customer }
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-[#ffdad6]/30 text-[#93000a]',
  Stitching: 'bg-[#fed488]/30 text-[#775a19]',
  Ready: 'bg-[#d3e4fe]/30 text-[#000000]',
  Delivered: 'bg-[#dce9ff] text-[#45464d]',
}

export default function RecentOrderCard({ order }: RecentOrderCardProps) {
  return (
    <Link href={`/order/${order.id}`}>
      <div className="bg-white p-5 rounded-[24px] shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-[#c6c6cd]/20 flex justify-between items-center active:scale-[0.98] transition-all">
        <div className="space-y-1">
          <p className="text-[18px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'Manrope' }}>
            {order.customer.name}
          </p>
          <p className="text-[14px] text-[#45464d]">{order.items.map(i => i.name).join(', ')}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusStyles[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>
        <ChevronRight size={20} className="text-[#c6c6cd] flex-shrink-0" />
      </div>
    </Link>
  )
}
