import { Suspense } from 'react'
import { and, gte, lt, sum, count, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { orders, customers } from '@/db/schema'
import FilterSelect from '@/components/ui/FilterSelect'
import { getDateFrom, getDateTo, PERIOD_LABELS } from '../orders/constants'

const PERIOD_OPTIONS = [
  { value: 'current', label: 'Current Month' },
  { value: 'month',   label: 'Last Month' },
  { value: 'week',    label: 'Last Week'  },
  { value: '3m',      label: 'Last 3 Months' },
  { value: '6m',      label: 'Last 6 Months' },
  { value: 'year',    label: 'Last Year'  },
]

interface Props {
  searchParams: Promise<{ period?: string }>
}

export default async function RevenuePage({ searchParams }: Props) {
  const { period } = await searchParams
  const activePeriod = period && PERIOD_LABELS[period] ? period : 'current'
  const dateFrom     = getDateFrom(activePeriod)!
  const dateTo       = getDateTo(activePeriod)

  const where = and(
    gte(orders.orderDate, dateFrom),
    dateTo ? lt(orders.orderDate, dateTo) : undefined,
  )

  const [stats, topCustomers] = await Promise.all([
    db.select({
      totalRevenue:   sum(orders.totalAmount),
      totalCollected: sum(orders.advancePaid),
      orderCount:     count(),
    }).from(orders).where(where),

    db.select({
      name:       customers.name,
      revenue:    sum(orders.totalAmount),
      orderCount: count(orders.id),
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(where)
    .groupBy(customers.id, customers.name)
    .orderBy(desc(sum(orders.totalAmount)))
    .limit(5),
  ])

  const totalRevenue   = parseFloat(stats[0]?.totalRevenue   ?? '0')
  const totalCollected = parseFloat(stats[0]?.totalCollected ?? '0')
  const totalBalance   = totalRevenue - totalCollected
  const orderCount     = Number(stats[0]?.orderCount ?? 0)
  const avgOrderValue  = orderCount > 0 ? totalRevenue / orderCount : 0
  const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0
  const fmt = (n: number) =>
    n >= 1000
      ? `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
      : `₹${Math.round(n)}`

  const fmtFull = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

  return (
    <div className="py-6 flex flex-col gap-5 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
          Revenue
        </h1>
        <span className="text-[12px] font-semibold text-ink-soft">{orderCount} orders</span>
      </div>

      {/* Period selector */}
      <Suspense>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          <FilterSelect param="period" options={PERIOD_OPTIONS} defaultLabel="Current Month" />
        </div>
      </Suspense>

      {orderCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="w-16 h-16 rounded-full bg-brand-tint flex items-center justify-center">
            <span className="text-[28px]">📊</span>
          </div>
          <p className="text-[16px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
            No orders in this period
          </p>
          <p className="text-[13px] text-ink-soft">Try selecting a wider time range.</p>
        </div>
      ) : (
        <>
          {/* Hero — Total Revenue */}
          <div className="bg-gradient-to-br from-brand to-brand-deep rounded-[24px] p-6">
            <p className="text-[11px] font-semibold tracking-widest text-white/50 uppercase mb-2">
              Total Revenue · {PERIOD_LABELS[activePeriod]}
            </p>
            <p className="text-[36px] font-bold text-white leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>
              {fmtFull(totalRevenue)}
            </p>
            <p className="text-[13px] text-white/50 mt-2">{orderCount} orders this period</p>
          </div>

          {/* Collected + Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[20px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4">
              <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-1">Collected</p>
              <p className="text-[20px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                {fmtFull(totalCollected)}
              </p>
            </div>
            <div className="bg-white rounded-[20px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4">
              <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-1">Balance Due</p>
              <p className={`text-[20px] font-bold ${totalBalance > 0 ? 'text-danger' : 'text-ink-soft'}`}
                 style={{ fontFamily: 'var(--font-manrope)' }}>
                {totalBalance > 0 ? fmtFull(totalBalance) : '—'}
              </p>
            </div>
          </div>

          {/* Collection rate */}
          <div className="bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">Collection Rate</p>
              <p className="text-[22px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                {collectionRate}%
              </p>
            </div>
            <div className="h-2.5 bg-brand-tint rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <p className="text-[12px] text-ink-muted mt-2">
              {fmtFull(totalCollected)} of {fmtFull(totalRevenue)} received
            </p>
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[20px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-4">
              <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-1">Avg Order</p>
              <p className="text-[20px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                {fmtFull(avgOrderValue)}
              </p>
            </div>
            <div className="bg-accent rounded-[20px] p-4">
              <p className="text-[11px] font-semibold tracking-widest text-white/60 uppercase mb-1">Orders</p>
              <p className="text-[20px] font-bold text-white" style={{ fontFamily: 'var(--font-manrope)' }}>
                {orderCount}
              </p>
              <p className="text-[11px] text-white/60 mt-0.5">this period</p>
            </div>
          </div>

          {/* Top customers */}
          {topCustomers.length > 0 && (
            <div className="bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5">
              <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-4">
                Top Customers
              </p>
              <div className="flex flex-col divide-y divide-line/30">
                {topCustomers.map((c, i) => {
                  const rev = parseFloat(c.revenue ?? '0')
                  return (
                    <div key={c.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-canvas border border-line/60 flex items-center justify-center text-[10px] font-bold text-ink-soft">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-[14px] font-medium text-ink">{c.name}</p>
                          <p className="text-[11px] text-ink-muted">{c.orderCount} {Number(c.orderCount) === 1 ? 'order' : 'orders'}</p>
                        </div>
                      </div>
                      <span className="text-[15px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {fmtFull(rev)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}
