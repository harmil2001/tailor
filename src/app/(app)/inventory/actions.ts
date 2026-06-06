'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { fabrics } from '@/db/schema'
import type { FabricPattern } from '@/db/schema'
import { syncLowStockAlert } from './alertActions'

type FabricPayload = {
  brand: string
  dealerName: string
  color: string
  pattern: FabricPattern
  purchasePricePerMeter: string
  sellingPriceFactor: string
  totalMeters: string
  availableMeters: string
}

function validate(data: FabricPayload): string | null {
  if (!data.brand.trim())      return 'Brand is required'
  if (!data.dealerName.trim()) return 'Dealer name is required'
  if (!data.color.trim())      return 'Color is required'
  if (!data.pattern)           return 'Pattern is required'
  if (Number(data.purchasePricePerMeter) <= 0) return 'Purchase price must be greater than 0'
  if (Number(data.sellingPriceFactor) <= 0)    return 'Selling price factor must be greater than 0'
  if (Number(data.totalMeters) <= 0)           return 'Total meters must be greater than 0'
  if (Number(data.availableMeters) < 0)        return 'Available meters cannot be negative'
  if (Number(data.availableMeters) > Number(data.totalMeters))
    return 'Available meters cannot exceed total meters'
  return null
}

export async function createFabric(
  data: FabricPayload,
): Promise<{ success: boolean; fabricId?: string; error?: string }> {
  try {
    const err = validate(data)
    if (err) return { success: false, error: err }

    const [row] = await db
      .insert(fabrics)
      .values({
        brand:                  data.brand.trim(),
        dealerName:             data.dealerName.trim(),
        color:                  data.color.trim(),
        pattern:                data.pattern,
        purchasePricePerMeter:  data.purchasePricePerMeter,
        sellingPriceFactor:     data.sellingPriceFactor,
        totalMeters:            data.totalMeters,
        availableMeters:        data.availableMeters,
      })
      .returning({ id: fabrics.id })

    await syncLowStockAlert(row.id, data.availableMeters, data.totalMeters)
    revalidatePath('/inventory')
    revalidatePath('/')
    return { success: true, fabricId: row.id }
  } catch (err) {
    console.error('[createFabric]', err)
    return { success: false, error: 'Failed to add fabric. Please try again.' }
  }
}

export async function updateFabric(
  id: string,
  data: FabricPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const err = validate(data)
    if (err) return { success: false, error: err }

    await db
      .update(fabrics)
      .set({
        brand:                  data.brand.trim(),
        dealerName:             data.dealerName.trim(),
        color:                  data.color.trim(),
        pattern:                data.pattern,
        purchasePricePerMeter:  data.purchasePricePerMeter,
        sellingPriceFactor:     data.sellingPriceFactor,
        totalMeters:            data.totalMeters,
        availableMeters:        data.availableMeters,
      })
      .where(eq(fabrics.id, id))

    await syncLowStockAlert(id, data.availableMeters, data.totalMeters)
    revalidatePath('/inventory')
    revalidatePath(`/inventory/${id}`)
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('[updateFabric]', err)
    return { success: false, error: 'Failed to update fabric. Please try again.' }
  }
}

export async function deleteFabric(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(fabrics).where(eq(fabrics.id, id))
    revalidatePath('/inventory')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('[deleteFabric]', err)
    return { success: false, error: 'Failed to delete fabric. Please try again.' }
  }
}
