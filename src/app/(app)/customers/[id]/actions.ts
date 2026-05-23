'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { customers } from '@/db/schema'

export interface UpdateCustomerResult {
  success?: boolean
  error?: string
}

export async function updateCustomer(
  id: string,
  data: { name: string; phone: string; measurements: Record<string, string> },
): Promise<UpdateCustomerResult> {
  try {
    if (!data.name.trim()) return { error: 'Name is required' }
    if (!data.phone.trim()) return { error: 'Phone number is required' }

    await db
      .update(customers)
      .set({ name: data.name.trim(), phone: data.phone.trim(), measurements: data.measurements })
      .where(eq(customers.id, id))

    revalidatePath(`/customers/${id}`)
    return { success: true }
  } catch (err) {
    console.error('[updateCustomer]', err)
    return { error: 'Failed to save changes' }
  }
}
