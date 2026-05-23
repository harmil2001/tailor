import { and, eq, gte, desc } from 'drizzle-orm'
import { FileText } from 'lucide-react'
import { db } from '@/db'
import { orders, customers } from '@/db/schema'
import type { OrderStatus } from '@/db/schema'
import FilterRow from './_components/FilterRow'
import OrderList from './_components/OrderList'
import CreateOrderSheet from '@/components/orders/CreateOrderSheet'
import { PAGE_SIZE, getDateFrom } from './constants'
import type { OrderFilters } from './constants'

const VALID_STATUSES: OrderStatus[] = ['Pending', 'Stitching', 'Ready', 'Delivered', 'Cancelled']

interface Props {
  searchParams: Promise<{ status?: string; period?: string; customer?: string }>
}

export default async function OrdersPage({ searchParams }: Props) {
  const { status, period, customer } = await searchParams

  const activeStatus     = VALID_STATUSES.find(s => s === status) ?? null
  const dateFrom         = getDateFrom(period ?? null)
  const activeCustomerId = customer ?? null

  const filters: OrderFilters = {
    status:     activeStatus,
    sort:       null,
    dateFrom,
    customerId: activeCustomerId,
  }

  const where = and(
    activeStatus     ? eq(orders.status, activeStatus)               : undefined,
    dateFrom         ? gte(orders.orderDate, dateFrom)               : undefined,
    activeCustomerId ? eq(orders.customerId, activeCustomerId)       : undefined,
  )

  const [initialOrders, total, allCustomers] = await Promise.all([
    db.query.orders.findMany({
      with: { customer: true },
      where,
      orderBy: [desc(orders.createdAt)],
      limit: PAGE_SIZE,
    }),
    db.$count(orders, where),
    db.select({ id: customers.id, name: customers.name, phone: customers.phone })
      .from(customers)
      .orderBy(customers.name),
  ])

  return (
    <div className="py-6 flex flex-col gap-4 max-w-lg mx-auto">

      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
          Orders
        </h1>
        <span className="text-[12px] font-semibold text-[#45464d]">
          {total} {activeStatus ? activeStatus.toLowerCase() : 'total'}
        </span>
      </div>

      <FilterRow customers={allCustomers} />

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 rounded-full bg-[#e5eeff] flex items-center justify-center">
            <FileText size={28} className="text-[#45464d]" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
              No orders found
            </p>
            <p className="text-[13px] text-[#45464d] mt-1">Try adjusting your filters.</p>
          </div>
          {!activeStatus && !dateFrom && !activeCustomerId && (
            <CreateOrderSheet customers={allCustomers} variant="inline" />
          )}
        </div>
      ) : (
        <OrderList
          key={`${activeStatus}-${dateFrom}-${activeCustomerId}`}
          initialOrders={initialOrders}
          filters={filters}
        />
      )}

      <CreateOrderSheet customers={allCustomers} variant="fab" />

    </div>
  )
}
