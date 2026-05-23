import type { OrderStatus } from '@/db/schema'

export const PAGE_SIZE = 10

export const PERIOD_DAYS: Record<string, number> = {
  week:  7,
  month: 30,
  '3m':  90,
  '6m':  180,
  year:  365,
}

export const PERIOD_LABELS: Record<string, string> = {
  week:  'Last Week',
  month: 'Last Month',
  '3m':  'Last 3 Months',
  '6m':  'Last 6 Months',
  year:  'Last Year',
}

export type SortOption = 'high' | 'low'

export interface OrderFilters {
  status:     OrderStatus | null
  sort:       SortOption  | null
  dateFrom:   string      | null
  customerId: string      | null
}

export function getDateFrom(period: string | null): string | null {
  if (!period || !PERIOD_DAYS[period]) return null
  const d = new Date()
  d.setDate(d.getDate() - PERIOD_DAYS[period])
  return d.toISOString().split('T')[0]
}
