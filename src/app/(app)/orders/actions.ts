'use server'

import { and, eq, gte, lt, desc, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/db'
import { orders } from '@/db/schema'
import type { ClothProvidedBy } from '@/db/schema'

type OrderItem = { name: string; clothProvidedBy: ClothProvidedBy }

import { PAGE_SIZE } from './constants'
import type { OrderFilters } from './constants'

export async function updateOrder(
  id: string,
  data: {
    items: OrderItem[]
    orderDate: string
    totalAmount: string
    advancePaid: string
    status: import('@/db/schema').OrderStatus
    notes?: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.items.length || data.items.every(i => !i.name.trim()))
      return { success: false, error: 'At least one item is required' }
    if (!data.orderDate)        return { success: false, error: 'Order date is required' }
    if (data.status !== 'Cancelled' && Number(data.totalAmount) <= 0)
      return { success: false, error: 'Total amount must be greater than 0' }

    await db
      .update(orders)
      .set({
        items:       data.items.filter(i => i.name.trim()).map(i => ({ name: i.name.trim(), clothProvidedBy: i.clothProvidedBy })),
        orderDate:   data.orderDate,
        totalAmount: data.totalAmount || '0',
        advancePaid: data.advancePaid || '0',
        status:      data.status,
        notes:       data.notes ?? null,
      })
      .where(eq(orders.id, id))

    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('[updateOrder]', err)
    return { success: false, error: 'Failed to update order. Please try again.' }
  }
}

export async function createOrder(data: {
  customerId: string
  items: OrderItem[]
  orderDate: string
  totalAmount: string
  advancePaid: string
  notes?: string
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    if (!data.customerId)        return { success: false, error: 'Customer is required' }
    if (!data.items.length || data.items.every(i => !i.name.trim()))
      return { success: false, error: 'At least one item is required' }
    if (!data.orderDate)         return { success: false, error: 'Order date is required' }
    if (!data.totalAmount || Number(data.totalAmount) <= 0)
      return { success: false, error: 'Total amount must be greater than 0' }

    const session = await auth()
    const userId = session?.user?.id ?? null

    const [row] = await db
      .insert(orders)
      .values({
        customerId:  data.customerId,
        userId,
        items:       data.items.filter(i => i.name.trim()).map(i => ({ name: i.name.trim(), clothProvidedBy: i.clothProvidedBy })),
        orderDate:   data.orderDate,
        totalAmount: data.totalAmount,
        advancePaid: data.advancePaid || '0',
        notes:       data.notes ?? null,
        status:      'Pending',
      })
      .returning({ id: orders.id })

    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true, orderId: row.id }
  } catch (err) {
    console.error('[createOrder]', err)
    return { success: false, error: 'Failed to create order. Please try again.' }
  }
}

export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(orders).where(eq(orders.id, id))
    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('[deleteOrder]', err)
    return { success: false, error: 'Failed to delete order. Please try again.' }
  }
}

export async function fetchOrdersPage(filters: OrderFilters, offset: number) {
  const where = and(
    filters.status     ? eq(orders.status, filters.status)         : undefined,
    filters.dateFrom   ? gte(orders.orderDate, filters.dateFrom)   : undefined,
    filters.dateTo     ? lt(orders.orderDate, filters.dateTo)      : undefined,
    filters.customerId ? eq(orders.customerId, filters.customerId) : undefined,
  )

  const orderBy = filters.sort === 'high' ? [desc(orders.totalAmount)]
                : filters.sort === 'low'  ? [asc(orders.totalAmount)]
                : [desc(orders.createdAt)]

  return db.query.orders.findMany({
    with: { customer: true },
    where,
    orderBy,
    limit: PAGE_SIZE,
    offset,
  })
}
