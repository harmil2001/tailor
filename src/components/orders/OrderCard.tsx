import Link from 'next/link'
import type { Order, Customer } from '@/db/schema'
import OrderActionsMenu from './OrderActionsMenu'

interface OrderCardProps {
  order: Order & { customer: Customer }
}

const statusStyles: Record<string, string> = {
  Pending:   'bg-[#ffdad6] text-[#93000a]',
  Stitching: 'bg-[#fed488] text-[#785a1a]',
  Ready:     'bg-[#d3e4fe] text-[#000000]',
  Delivered: 'bg-[#dce9ff] text-[#45464d]',
  Cancelled: 'bg-[#e5e5ea] text-[#45464d]',
}

export default function OrderCard({ order }: OrderCardProps) {
  const balance = (parseFloat(order.totalAmount) - parseFloat(order.advancePaid)).toFixed(2)
  const isPaid  = parseFloat(balance) === 0

  return (
    <div className="relative">
      <Link href={`/order/${order.id}`} className="block">
        <div className="bg-white p-5 rounded-[24px] border border-[#c6c6cd]/20 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] active:scale-[0.98] transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-[18px] font-semibold text-[#0b1c30] truncate" style={{ fontFamily: 'Manrope' }}>
                {order.customer.name}
              </p>
              <div className="flex flex-wrap items-center gap-1 mt-3">
                <span className="text-[11px] font-semibold tracking-widest text-[#45464d] uppercase">Items</span>
                <span className="text-[#c6c6cd]">·</span>
                {order.items.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#f0f0f5] text-[#0b1c30] text-[11px] font-medium">
                    {item.name}
                  </span>
                ))}
              </div>
              <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${statusStyles[order.status]}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#c6c6cd]/40 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-[#45464d] uppercase">Order Date</p>
              <p className="text-[14px] font-semibold text-[#0b1c30] mt-0.5" style={{ fontFamily: 'Manrope' }}>
                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-widest text-[#45464d] uppercase">Balance Due</p>
              <p className={`text-[16px] font-bold mt-0.5 ${isPaid ? 'text-[#45464d]' : 'text-[#ba1a1a]'}`} style={{ fontFamily: 'Manrope' }}>
                {isPaid ? 'Paid ✓' : `₹${balance}`}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-4 right-4 z-10">
        <OrderActionsMenu order={order} />
      </div>
    </div>
  )
}
