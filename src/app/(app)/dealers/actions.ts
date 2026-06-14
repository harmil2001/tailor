'use server'

import { asc, ilike, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { dealers, dealerLedgerEntries } from '@/db/schema'
import { DEALERS_PAGE_SIZE } from './constants'

export type DealerWithBalance = {
  id: string
  name: string
  createdAt: Date
  totalCredit: string
  totalDebit: string
}

export async function createDealer(
  name: string,
): Promise<{ success: boolean; dealerId?: string; error?: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: 'Name is required.' }

  try {
    const [row] = await db
      .insert(dealers)
      .values({ name: trimmed })
      .returning({ id: dealers.id })

    revalidatePath('/dealers')
    return { success: true, dealerId: row.id }
  } catch (err) {
    console.error('[createDealer]', err)
    const msg = err instanceof Error && err.message.includes('unique')
      ? 'A dealer with this name already exists.'
      : 'Failed to create dealer. Please try again.'
    return { success: false, error: msg }
  }
}

export async function fetchDealersPage(
  offset: number,
  query?: string,
): Promise<DealerWithBalance[]> {
  const where = query?.trim() ? ilike(dealers.name, `%${query.trim()}%`) : undefined

  return db
    .select({
      id: dealers.id,
      name: dealers.name,
      createdAt: dealers.createdAt,
      totalCredit: sql<string>`COALESCE(SUM(${dealerLedgerEntries.creditAmount}), 0)`,
      totalDebit: sql<string>`COALESCE(SUM(${dealerLedgerEntries.debitAmount}), 0)`,
    })
    .from(dealers)
    .leftJoin(dealerLedgerEntries, eq(dealerLedgerEntries.dealerId, dealers.id))
    .where(where)
    .groupBy(dealers.id)
    .orderBy(asc(dealers.name))
    .limit(DEALERS_PAGE_SIZE)
    .offset(offset)
}

export async function addLedgerEntry(data: {
  dealerId: string
  billDate: string
  particulars: string
  voucherType: string
  voucherNo: string
  entryType: 'credit' | 'debit'
  amount: string
}): Promise<{ success: boolean; error?: string }> {
  if (!data.dealerId || !data.billDate || !data.particulars.trim() || !data.voucherType.trim() || !data.voucherNo.trim()) {
    return { success: false, error: 'All fields are required.' }
  }
  const amount = parseFloat(data.amount)
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Amount must be a positive number.' }
  }

  try {
    await db.insert(dealerLedgerEntries).values({
      dealerId: data.dealerId,
      billDate: data.billDate,
      particulars: data.particulars.trim(),
      voucherType: data.voucherType.trim(),
      voucherNo: data.voucherNo.trim(),
      creditAmount: data.entryType === 'credit' ? data.amount : null,
      debitAmount: data.entryType === 'debit' ? data.amount : null,
    })

    revalidatePath(`/dealers/${data.dealerId}`)
    revalidatePath('/dealers')
    return { success: true }
  } catch (err) {
    console.error('[addLedgerEntry]', err)
    return { success: false, error: 'Failed to save entry. Please try again.' }
  }
}
