import Link from 'next/link'
import { count, sum, eq, inArray, asc, gte, and } from 'drizzle-orm'
import { Users, ShoppingBag, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { db } from '@/db'
import { orders, customers } from '@/db/schema'
import CreateCustomerSheet from '@/components/customers/CreateCustomerSheet'
import CreateOrderSheet from '@/components/orders/CreateOrderSheet'
import { getDateFrom } from './orders/constants'

async function getDashboardData() {
  const monthFrom = getDateFrom('current')!

  const [totalCustomers, activeOrders, readyOrders, monthOrders, monthRevenue, allCustomers] = await Promise.all([
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
  ])

  return {
    totalCustomers: Number(totalCustomers[0]?.count ?? 0),
    activeOrders:   Number(activeOrders[0]?.count ?? 0),
    readyOrders:    Number(readyOrders[0]?.count ?? 0),
    monthOrders:    Number(monthOrders[0]?.count ?? 0),
    monthRevenue:   parseFloat(monthRevenue[0]?.total     ?? '0'),
    monthCollected: parseFloat(monthRevenue[0]?.collected ?? '0'),
    allCustomers,
  }
}

function fmtRevenue(n: number) {
  return n >= 1000
    ? `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : `₹${Math.round(n)}`
}

export default async function DashboardPage() {
  const { totalCustomers, activeOrders, readyOrders, monthOrders, monthRevenue, monthCollected, allCustomers } = await getDashboardData()
  const monthBalance      = monthRevenue - monthCollected
  const monthCollectionPct = monthRevenue > 0 ? Math.round((monthCollected / monthRevenue) * 100) : 0

  return (
    <div className="py-6 flex flex-col gap-6 max-w-lg mx-auto">

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <CreateOrderSheet customers={allCustomers} variant="card" />
        <CreateCustomerSheet variant="card" />
      </section>

      {/* Stat Cards */}
      <section className="flex flex-col gap-3">

        {/* Customers card */}
        <Link href="/customers">
          <div className="bg-[#f4f7ff] rounded-[20px] border border-[#dce8ff]/60 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 flex items-center justify-between active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#dce8ff] flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-[#1a3a8f]" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#4a5568]">Total Customers</p>
                <p className="text-[32px] font-bold text-[#0b1c30] leading-tight" style={{ fontFamily: 'Manrope' }}>
                  {totalCustomers}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#1a3a8f]/30" />
          </div>
        </Link>

        {/* Orders card */}
        <Link href="/orders">
          <div className="bg-white rounded-[20px] border border-[#c6c6cd]/20 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#fdefc8] flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={22} className="text-[#775a19]" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#4a5568]">Orders This Month</p>
                  <p className="text-[32px] font-bold text-[#0b1c30] leading-tight" style={{ fontFamily: 'Manrope' }}>
                    {monthOrders}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#775a19]/30" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#fff8e6] rounded-[14px] px-3 py-2.5 flex items-center gap-2">
                <Clock size={14} className="text-[#785a1a] flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-[#785a1a]/70">In Progress</p>
                  <p className="text-[16px] font-bold text-[#0b1c30]">{activeOrders}</p>
                </div>
              </div>
              <div className="bg-[#edfaf3] rounded-[14px] px-3 py-2.5 flex items-center gap-2">
                <CheckCircle size={14} className="text-[#1a5c34] flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-[#1a5c34]/70">Ready</p>
                  <p className="text-[16px] font-bold text-[#0b1c30]">{readyOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Revenue card */}
        <Link href="/revenue?period=current">
          <div className="bg-gradient-to-br from-[#0b1c30] to-[#1a2f48] rounded-[20px] p-5 active:scale-[0.98] transition-all">
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

      </section>
    </div>
  )
}
