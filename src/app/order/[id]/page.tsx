import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { orders } from '@/db/schema'
import TieLogo from '@/components/ui/TieLogo'
import BackButton from './_components/BackButton'
import CopyOrderId from './_components/CopyOrderId'
import OrderTimeline from './_components/OrderTimeline'

interface Props {
  params: Promise<{ id: string }>
}

const statusStyles: Record<string, { pill: string; label: string }> = {
  Pending:   { pill: 'bg-[#ffdad6] text-[#93000a]',  label: 'Pending' },
  Stitching: { pill: 'bg-[#fed488] text-[#785a1a]',  label: 'Stitching' },
  Ready:     { pill: 'bg-[#d3e4fe] text-[#000000]',  label: 'Ready for Pickup' },
  Delivered: { pill: 'bg-[#dce9ff] text-[#45464d]',  label: 'Delivered' },
  Cancelled: { pill: 'bg-[#e5e5ea] text-[#45464d]',  label: 'Cancelled' },
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[#c6c6cd]/40 last:border-0">
      <span className="text-[13px] text-[#45464d]">{label}</span>
      <span className={`text-[14px] font-semibold ${accent ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
        {value}
      </span>
    </div>
  )
}

export default async function PublicOrderPage({ params }: Props) {
  const { id } = await params

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { customer: true },
  })

  if (!order) notFound()

  const total    = parseFloat(order.totalAmount)
  const advance  = parseFloat(order.advancePaid)
  const balance  = total - advance
  const isPaid   = balance === 0
  const style    = statusStyles[order.status] ?? statusStyles.Pending

  const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-dvh bg-[#f8f9ff] flex flex-col items-center px-4">

      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#c6c6cd]/40 px-4 h-14 flex items-center">
        <div className="w-full max-w-sm mx-auto">
          <BackButton />
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6 pt-20 pb-8">

        {/* Shop header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
            <TieLogo size={32} />
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
              My Brothers
            </p>
            <p className="text-[12px] text-[#45464d]">Clothing & Tailoring</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-center">
          <span className={`px-5 py-2 rounded-full text-[13px] font-bold tracking-wide ${style.pill}`}>
            {style.label}
          </span>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-[24px] border border-[#c6c6cd]/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 flex flex-col gap-1">
          <p className="text-[20px] font-bold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
            {order.customer.name}
          </p>
          <p className="text-[15px] text-[#45464d]">{order.items.map(i => i.name).join(', ')}</p>
          <p className="text-[12px] text-[#76777d] mt-1">Ordered on {orderDate}</p>
        </div>

        {/* Timeline */}
        <OrderTimeline status={order.status} />

        {/* Financial breakdown */}
        <div className="bg-white rounded-[24px] border border-[#c6c6cd]/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-1">
          <Row label="Total Amount"  value={`₹${total.toLocaleString('en-IN')}`} />
          <Row label="Advance Paid"  value={`₹${advance.toLocaleString('en-IN')}`} />
          <Row
            label="Balance Due"
            value={isPaid ? 'Paid ✓' : `₹${balance.toLocaleString('en-IN')}`}
            accent={!isPaid}
          />
        </div>

        {/* Extra details */}
        <div className="bg-white rounded-[24px] border border-[#c6c6cd]/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-widest text-[#45464d] uppercase">Cloth</span>
            <span className="text-[14px] text-[#0b1c30]">
              {order.clothProvidedBy === 'Customer' ? 'Provided by customer' : 'Provided by shop'}
            </span>
          </div>
          {order.notes && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-widest text-[#45464d] uppercase">Notes</span>
              <span className="text-[14px] text-[#0b1c30] leading-relaxed">{order.notes}</span>
            </div>
          )}
        </div>

        <CopyOrderId id={order.id} />

        <p className="text-center text-[11px] text-[#76777d]">
          My Brothers · Clothing & Tailoring
        </p>

      </div>
    </div>
  )
}
