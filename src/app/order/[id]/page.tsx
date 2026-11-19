import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { orders } from '@/db/schema'
import BrandLogo from '@/components/ui/BrandLogo'
import BackButton from './_components/BackButton'
import CopyOrderId from './_components/CopyOrderId'
import OrderTimeline from './_components/OrderTimeline'
import { BRAND, BRAND_FULL } from '@/lib/brand'

interface Props {
  params: Promise<{ id: string }>
}

const statusStyles: Record<string, { pill: string; label: string }> = {
  Pending:   { pill: 'bg-danger-tint text-danger-ink',  label: 'Pending' },
  Stitching: { pill: 'bg-accent-tint text-accent-ink',  label: 'Stitching' },
  Ready:     { pill: 'bg-info-tint text-ink',  label: 'Ready for Pickup' },
  Delivered: { pill: 'bg-brand-tint text-ink-soft',  label: 'Delivered' },
  Cancelled: { pill: 'bg-neutral-tint text-ink-soft',  label: 'Cancelled' },
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-line/40 last:border-0">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className={`text-[14px] font-semibold ${accent ? 'text-danger' : 'text-ink'}`}>
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
    <>
      <style>{`
        @media print {
          @page { margin: 16mm; }
          body { background: white !important; }
          .print-card {
            box-shadow: none !important;
            border: 1px solid var(--color-line) !important;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-dvh bg-canvas print:bg-white flex flex-col items-center px-4">

        {/* Fixed top bar — hidden on print */}
        <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-line/40 px-4 h-14 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <BackButton />
          </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-6 pt-20 print:pt-0 pb-8">

          {/* Shop header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center">
              <BrandLogo size={32} />
            </div>
            <div>
              <p className="text-[18px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                {BRAND.name}
              </p>
              <p className="text-[12px] text-ink-soft">{BRAND.tagline}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-center">
            <span className={`px-5 py-2 rounded-full text-[13px] font-bold tracking-wide ${style.pill}`}>
              {style.label}
            </span>
          </div>

          {/* Order summary card */}
          <div className="print-card bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 flex flex-col gap-1">
            <p className="text-[20px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
              {order.customer.name}
            </p>
            <p className="text-[15px] text-ink-soft">{order.items.map(i => i.name).join(', ')}</p>
            <p className="text-[12px] text-ink-muted mt-1">Ordered on {orderDate}</p>
          </div>

          {/* Timeline */}
          <OrderTimeline status={order.status} />

          {/* Financial breakdown */}
          <div className="print-card bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-1">
            <Row label="Total Amount"  value={`₹${total.toLocaleString('en-IN')}`} />
            <Row label="Advance Paid"  value={`₹${advance.toLocaleString('en-IN')}`} />
            <Row
              label="Balance Due"
              value={isPaid ? 'Paid ✓' : `₹${balance.toLocaleString('en-IN')}`}
              accent={!isPaid}
            />
          </div>

          {/* Extra details */}
          <div className="print-card bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">Cloth</span>
              {order.items.map((item, i) => (
                <span key={i} className="text-[14px] text-ink">
                  {item.name} — {item.clothProvidedBy === 'Customer' ? 'provided by customer' : 'provided by shop'}
                </span>
              ))}
            </div>
            {order.notes && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">Notes</span>
                <span className="text-[14px] text-ink leading-relaxed">{order.notes}</span>
              </div>
            )}
          </div>

          {/* Copy order ID — hidden on print */}
          <div className="print:hidden">
            <CopyOrderId id={order.id} />
          </div>

          <p className="text-center text-[11px] text-ink-muted">
            {BRAND_FULL}
          </p>

        </div>
      </div>
    </>
  )
}
