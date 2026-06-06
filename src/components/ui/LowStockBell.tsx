import { desc, isNull, eq, or, gte } from 'drizzle-orm'
import { db } from '@/db'
import { lowStockAlerts } from '@/db/schema'
import LowStockBellClient from './LowStockBellClient'

export default async function LowStockBell() {
  // Show active alerts + any acknowledged in the last 14 days
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const alerts = await db.query.lowStockAlerts.findMany({
    with: { fabric: true },
    where: or(
      isNull(lowStockAlerts.acknowledgedAt),
      gte(lowStockAlerts.acknowledgedAt, cutoff),
    ),
    orderBy: [desc(lowStockAlerts.createdAt)],
  })

  const activeCount = alerts.filter(a => !a.acknowledgedAt).length
  if (alerts.length === 0) return null

  return <LowStockBellClient alerts={alerts} activeCount={activeCount} />
}
