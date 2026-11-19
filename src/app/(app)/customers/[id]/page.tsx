import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, sum, count } from 'drizzle-orm'
import { ArrowLeft, Ruler, ChevronRight } from 'lucide-react'
import { db } from '@/db'
import { customers, orders } from '@/db/schema'
import EditCustomerSheet from './_components/EditCustomerSheet'
import CopyPhone from './_components/CopyPhone'

interface Props {
  params: Promise<{ id: string }>
}

const MEASUREMENT_KEYS = ['chest', 'waist', 'shoulder', 'shirtLength', 'trouser', 'inseam']

const MEASUREMENT_LABELS: Record<string, string> = {
  chest:       'Chest',
  waist:       'Waist',
  shoulder:    'Shoulder',
  shirtLength: 'Shirt Length',
  trouser:     'Trouser',
  inseam:      'Inseam',
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  })

  if (!customer) notFound()

  const stats = await db
    .select({ totalRevenue: sum(orders.totalAmount), orderCount: count() })
    .from(orders)
    .where(eq(orders.customerId, id))

  const totalRevenue = parseFloat(stats[0]?.totalRevenue ?? '0')
  const orderCount   = Number(stats[0]?.orderCount ?? 0)
  const memberSince  = new Date(customer.createdAt).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  })

  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const measurements = (customer.measurements ?? {}) as Record<string, string>
  const filledKeys    = MEASUREMENT_KEYS.filter(k => measurements[k])

  return (
    <div className="pb-8 flex flex-col gap-4 max-w-lg mx-auto">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-brand to-brand-deep rounded-b-[32px] px-5 pt-5 pb-6">

        {/* Top row: back + edit */}
        <div className="flex items-center justify-between mb-7">
          <Link
            href="/customers"
            className="flex items-center gap-2 text-white/70 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
            <span className="text-[14px] font-medium">Customers</span>
          </Link>
          <EditCustomerSheet customer={customer} variant="dark" />
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-[72px] h-[72px] rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center">
            <span className="text-[26px] font-bold text-white" style={{ fontFamily: 'var(--font-manrope)' }}>
              {initials}
            </span>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              {customer.name}
            </p>
            <p className="text-[12px] text-white/50 mt-1">Customer since {memberSince}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-px mt-6 rounded-2xl overflow-hidden border border-white/10">
          <Link href={`/orders?customer=${id}`} className="bg-white/8 px-4 py-3 text-center active:bg-white/15 transition-colors">
            <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase">Orders</p>
            <p className="text-[24px] font-bold text-white mt-0.5" style={{ fontFamily: 'var(--font-manrope)' }}>
              {orderCount}
            </p>
            <p className="text-[10px] text-white/40 flex items-center justify-center gap-0.5 mt-0.5">
              View all <ChevronRight size={10} />
            </p>
          </Link>
          <div className="bg-white/8 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase">Total Value</p>
            <p className="text-[24px] font-bold text-white mt-0.5" style={{ fontFamily: 'var(--font-manrope)' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Phone ────────────────────────────────────────── */}
      <div className="px-4">
        <CopyPhone phone={customer.phone} />
      </div>

      {/* ── Measurements ─────────────────────────────────── */}
      {filledKeys.length > 0 && (
        <div className="mx-4 bg-white rounded-[20px] border border-line/40 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-brand-tint flex items-center justify-center">
              <Ruler size={14} className="text-ink-soft" />
            </div>
            <p className="text-[13px] font-semibold text-ink">Measurements</p>
            <span className="ml-auto text-[11px] text-ink-muted">in inches</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filledKeys.map(key => (
              <div key={key} className="bg-canvas rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-ink-muted font-medium">{MEASUREMENT_LABELS[key]}</p>
                <p className="text-[17px] font-bold text-ink mt-0.5 leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {measurements[key]}<span className="text-[11px] font-normal text-ink-muted">"</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No measurements placeholder */}
      {filledKeys.length === 0 && (
        <div className="mx-4 bg-white rounded-[20px] border border-line/40 shadow-sm p-5 flex flex-col items-center gap-2 py-8">
          <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center">
            <Ruler size={18} className="text-ink-soft" />
          </div>
          <p className="text-[13px] font-semibold text-ink">No measurements yet</p>
          <p className="text-[12px] text-ink-muted text-center">Tap the edit button above to add measurements.</p>
        </div>
      )}

    </div>
  )
}
