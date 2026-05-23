'use server'

import { asc, ilike, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { customers } from '@/db/schema'
import { CUSTOMERS_PAGE_SIZE } from './constants'

export async function createCustomer(data: {
  name: string
  phone: string
  measurements?: Record<string, string>
}): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    const [row] = await db
      .insert(customers)
      .values({
        name: data.name.trim(),
        phone: data.phone.trim(),
        measurements: data.measurements ?? {},
      })
      .returning({ id: customers.id })

    revalidatePath('/customers')
    revalidatePath('/')
    return { success: true, customerId: row.id }
  } catch (err) {
    console.error('[createCustomer]', err)
    return { success: false, error: 'Failed to create customer. Please try again.' }
  }
}

export async function fetchCustomersPage(offset: number, query?: string) {
  const where = query?.trim()
    ? or(
        ilike(customers.name,  `%${query.trim()}%`),
        ilike(customers.phone, `%${query.trim()}%`),
      )
    : undefined

  return db
    .select()
    .from(customers)
    .where(where)
    .orderBy(asc(customers.name))
    .limit(CUSTOMERS_PAGE_SIZE)
    .offset(offset)
}
