'use server'

import { and, eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/db'
import { lowStockAlerts } from '@/db/schema'

const LOW_STOCK_THRESHOLD = 0.2

export async function syncLowStockAlert(
  fabricId: string,
  availableMeters: string,
  totalMeters: string,
): Promise<void> {
  const avail = parseFloat(availableMeters)
  const total = parseFloat(totalMeters)
  const isLow = total > 0 && avail < total * LOW_STOCK_THRESHOLD

  const existing = await db.query.lowStockAlerts.findFirst({
    where: and(eq(lowStockAlerts.fabricId, fabricId), isNull(lowStockAlerts.acknowledgedAt)),
  })

  if (isLow && !existing) {
    // New alert — fabric just dropped below threshold
    await db.insert(lowStockAlerts).values({
      fabricId,
      availableMeters,
      totalMeters,
    })
  } else if (!isLow && existing) {
    // Auto-resolve — fabric was restocked above threshold
    await db
      .update(lowStockAlerts)
      .set({ acknowledgedAt: new Date() })
      .where(eq(lowStockAlerts.id, existing.id))
  }
}

export async function acknowledgeAlert(
  alertId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    const userId  = session?.user?.id ?? null

    await db
      .update(lowStockAlerts)
      .set({
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
      })
      .where(eq(lowStockAlerts.id, alertId))

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('[acknowledgeAlert]', err)
    return { success: false, error: 'Failed to acknowledge alert.' }
  }
}
