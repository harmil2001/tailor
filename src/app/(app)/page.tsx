import Link from 'next/link'
import { count, eq, inArray, desc, asc } from 'drizzle-orm'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { db } from '@/db'
import { orders, customers } from '@/db/schema'
import MetricCard from '@/components/dashboard/MetricCard'
import RecentOrderCard from '@/components/dashboard/RecentOrderCard'
import CreateCustomerSheet from '@/components/customers/CreateCustomerSheet'
import CreateOrderSheet from '@/components/orders/CreateOrderSheet'

async function getDashboardData() {
  const [activeResult, readyResult, recentOrders, allCustomers] = await Promise.all([
    db.select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, ['Pending', 'Stitching'])),
    db.select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'Ready')),
    db.query.orders.findMany({
      where: inArray(orders.status, ['Pending', 'Stitching']),
      with: { customer: true },
      orderBy: [desc(orders.createdAt)],
      limit: 3,
    }),
    db.select({ id: customers.id, name: customers.name, phone: customers.phone })
      .from(customers)
      .orderBy(asc(customers.name)),
  ])

  return {
    activeCount: Number(activeResult[0]?.count ?? 0),
    readyCount: Number(readyResult[0]?.count ?? 0),
    recentOrders,
    allCustomers,
  }
}

export default async function DashboardPage() {
  const { activeCount, readyCount, recentOrders, allCustomers } = await getDashboardData()

  return (
    <div className="py-6 flex flex-col gap-8 max-w-lg mx-auto">

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-4">
        <MetricCard label="Active Orders" value={activeCount} icon={<TrendingUp size={18} className="text-[#775a19]" />} />
        <MetricCard label="Ready for Pickup" value={readyCount} accent icon={<CheckCircle size={18} className="text-[#775a19]" />} />
      </section>

      {/* Quick Actions */}
      <section className="flex gap-4">
        <div className="flex-1">
          <CreateOrderSheet customers={allCustomers} />
        </div>
        <div className="flex-1">
          <CreateCustomerSheet />
        </div>
      </section>

      {/* Recent Orders */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-[22px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'Manrope' }}>
            Recent Orders
          </h2>
          <Link href="/orders" className="text-[12px] font-semibold text-[#775a19] tracking-wide">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#c6c6cd]/30 p-10 text-center shadow-[0px_4px_12px_rgba(15,23,42,0.05)]">
            <p className="text-[14px] text-[#45464d]">No active orders yet.</p>
            <p className="text-[12px] text-[#76777d] mt-1">Create your first order to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <RecentOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="rounded-[24px] overflow-hidden relative h-40 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-black to-[#775a19]" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <p className="text-white text-[18px] font-semibold" style={{ fontFamily: 'Manrope' }}>
            My Brothers
          </p>
          <p className="text-white/70 text-[14px] mt-0.5">
            Clothing & Tailoring — Est. with pride.
          </p>
        </div>
      </section>

    </div>
  )
}
