import Link from 'next/link'
import { count, sum, eq, inArray, asc, gte, and, isNull, sql } from 'drizzle-orm'
import { fmtINR } from '@/lib/formatINR'
import { Users, ShoppingBag, Clock, CheckCircle, ChevronRight, Store } from 'lucide-react'
import { db } from '@/db'
import { orders, customers, lowStockAlerts, fabrics, dealers, dealerLedgerEntries } from '@/db/schema'
import CreateCustomerSheet from '@/components/customers/CreateCustomerSheet'
import CreateOrderSheet from '@/components/orders/CreateOrderSheet'
import LowStockSection from '@/components/inventory/LowStockSection'
import { getDateFrom } from './orders/constants'
import { FEATURES } from '@/lib/features'

async function getDashboardData() {
  const monthFrom = getDateFrom('current')!

  const [totalCustomers, activeOrders, readyOrders, monthOrders, monthRevenue, allCustomers, allFabrics, lowStockAlertsData, dealerStats] = await Promise.all([
    db.select({ count: count() }).from(customers),
    db.select({ count: count() }).from(orders).where(
      and(inArray(orders.status, ['Pending', 'Stitching']), gte(orders.orderDate, monthFrom))
    ),
    db.select({ count: count() }).from(orders).where(
      and(eq(orders.status, 'Ready'), gte(orders.orderDate, monthFrom))
    ),
    db.select({ count: count() }).from(orders).where(gte(orders.orderDate, monthFrom)),
    db.select({
      total:     sum(orders.totalAmount),
      collected: sum(orders.advancePaid),
    }).from(orders).where(gte(orders.orderDate, monthFrom)),
    db.select({ id: customers.id, name: customers.name, phone: customers.phone })
      .from(customers).orderBy(asc(customers.name)),
    // Both skipped while the Stock module is switched off (see src/lib/features.ts)
    FEATURES.stock
      ? db.select().from(fabrics).orderBy(asc(fabrics.brand))
      : Promise.resolve([]),
    FEATURES.stock
      ? db.query.lowStockAlerts.findMany({
          with: { fabric: true },
          where: isNull(lowStockAlerts.acknowledgedAt),
        })
      : Promise.resolve([]),
    // Skipped while the Dealers module is switched off (see src/lib/features.ts)
    FEATURES.dealers
      ? db.select({
          totalDealers: count(dealers.id),
          totalCredit:  sql<string>`COALESCE(SUM(${dealerLedgerEntries.creditAmount}), 0)`,
          totalDebit:   sql<string>`COALESCE(SUM(${dealerLedgerEntries.debitAmount}), 0)`,
        }).from(dealers).leftJoin(dealerLedgerEntries, eq(dealerLedgerEntries.dealerId, dealers.id))
      : Promise.resolve([]),
  ])

  return {
    totalCustomers:  Number(totalCustomers[0]?.count ?? 0),
    activeOrders:    Number(activeOrders[0]?.count ?? 0),
    readyOrders:     Number(readyOrders[0]?.count ?? 0),
    monthOrders:     Number(monthOrders[0]?.count ?? 0),
    monthRevenue:    parseFloat(monthRevenue[0]?.total     ?? '0'),
    monthCollected:  parseFloat(monthRevenue[0]?.collected ?? '0'),
    allCustomers,
    allFabrics,
    lowStockAlerts: lowStockAlertsData,
    totalDealers:   Number(dealerStats[0]?.totalDealers ?? 0),
    dealerCredit:   parseFloat(dealerStats[0]?.totalCredit ?? '0'),
    dealerDebit:    parseFloat(dealerStats[0]?.totalDebit  ?? '0'),
  }
}

function fmtRevenue(n: number) {
  return n >= 1000
    ? `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : `₹${Math.round(n)}`
}

export default async function DashboardPage() {
  const { totalCustomers, activeOrders, readyOrders, monthOrders, monthRevenue, monthCollected, allCustomers, allFabrics, lowStockAlerts: lowStockAlertsData, totalDealers, dealerCredit, dealerDebit } = await getDashboardData()
  const monthBalance       = monthRevenue - monthCollected
  const monthCollectionPct = monthRevenue > 0 ? Math.round((monthCollected / monthRevenue) * 100) : 0
  const dealerOutstanding  = dealerCredit - dealerDebit

  return (
    <div className="py-6 flex flex-col gap-6 max-w-lg mx-auto">

      {/* Low stock section */}
      {FEATURES.stock && <LowStockSection alerts={lowStockAlertsData} />}

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <CreateOrderSheet customers={allCustomers} fabrics={allFabrics} variant="card" />
        <CreateCustomerSheet variant="card" />
      </section>

      {/* Stat Cards */}
      <section className="flex flex-col gap-3">

        {/* Customers card */}
        <Link href="/customers">
          <div className="bg-brand-wash rounded-[20px] border border-brand-tint/60 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 flex items-center justify-between active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-info-ink" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-ink-soft">Total Customers</p>
                <p className="text-[32px] font-bold text-ink leading-tight" style={{ fontFamily: 'Manrope' }}>
                  {totalCustomers}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-info-ink/30" />
          </div>
        </Link>

        {/* Orders card */}
        <Link href="/orders">
          <div className="bg-white rounded-[20px] border border-line/20 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-tint flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={22} className="text-accent" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-ink-soft">Orders This Month</p>
                  <p className="text-[32px] font-bold text-ink leading-tight" style={{ fontFamily: 'Manrope' }}>
                    {monthOrders}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-accent/30" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-accent-wash rounded-[14px] px-3 py-2.5 flex items-center gap-2">
                <Clock size={14} className="text-accent-ink flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-accent-ink/70">In Progress</p>
                  <p className="text-[16px] font-bold text-ink">{activeOrders}</p>
                </div>
              </div>
              <div className="bg-success-wash rounded-[14px] px-3 py-2.5 flex items-center gap-2">
                <CheckCircle size={14} className="text-success flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-success/70">Ready</p>
                  <p className="text-[16px] font-bold text-ink">{readyOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Revenue card */}
        <Link href="/revenue?period=current">
          <div className="bg-gradient-to-br from-brand to-brand-deep rounded-[20px] p-5 active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold tracking-widest text-white/60 uppercase">
                Revenue · This Month
              </p>
              <ChevronRight size={18} className="text-white/40" />
            </div>
            <p className="text-[30px] font-bold text-white leading-none" style={{ fontFamily: 'Manrope' }}>
              {fmtRevenue(monthRevenue)}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-white/20">
              <div>
                <p className="text-[11px] text-white/50">Collected</p>
                <p className="text-[15px] font-bold text-white">{fmtRevenue(monthCollected)}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/50">Balance Due</p>
                <p className="text-[15px] font-bold text-white">
                  {monthBalance > 0 ? fmtRevenue(monthBalance) : '—'}
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full transition-all"
                style={{ width: `${monthCollectionPct}%` }}
              />
            </div>
            <p className="text-[11px] text-white/40 mt-1.5">{monthCollectionPct}% collected</p>
          </div>
        </Link>

        {/* Dealers card */}
        {FEATURES.dealers && (
        <Link href="/dealers">
          <div className="bg-accent-wash rounded-[20px] border border-accent-line/60 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-tint flex items-center justify-center flex-shrink-0">
                  <Store size={22} className="text-accent" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-ink-soft">Dealer Accounts</p>
                  <p className="text-[32px] font-bold text-ink leading-tight" style={{ fontFamily: 'Manrope' }}>
                    {totalDealers}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-accent/30" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-danger-tint/50 rounded-[14px] px-3 py-2.5">
                <p className="text-[10px] font-medium text-danger-ink/70">Total Credit</p>
                <p className="text-[14px] font-bold text-danger-ink">{fmtINR(dealerCredit)}</p>
              </div>
              <div className="bg-success-tint/60 rounded-[14px] px-3 py-2.5">
                <p className="text-[10px] font-medium text-success/70">Total Paid</p>
                <p className="text-[14px] font-bold text-success">{fmtINR(dealerDebit)}</p>
              </div>
              <div className={`rounded-[14px] px-3 py-2.5 ${dealerOutstanding > 0 ? 'bg-accent-wash' : 'bg-canvas'}`}>
                <p className="text-[10px] font-medium text-ink-soft/70">Outstanding</p>
                <p className={`text-[14px] font-bold ${dealerOutstanding > 0 ? 'text-accent' : 'text-ink-soft'}`}>
                  {dealerOutstanding > 0 ? fmtINR(dealerOutstanding) : '—'}
                </p>
              </div>
            </div>
          </div>
        </Link>
        )}

      </section>
    </div>
  )
}
