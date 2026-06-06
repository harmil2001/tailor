import { sql, asc, and, eq, ilike, gte, lt } from 'drizzle-orm'
import { Package } from 'lucide-react'
import { db } from '@/db'
import { fabrics } from '@/db/schema'
import type { FabricPattern } from '@/db/schema'
import FabricCard from '@/components/inventory/FabricCard'
import CreateFabricSheet from '@/components/inventory/CreateFabricSheet'
import InventoryFilters from './_components/InventoryFilters'
import { getDateFrom, getDateTo } from '../orders/constants'

const PATTERNS: FabricPattern[] = ['Plain', 'Printed', 'Chequered', 'Striped', 'Dotted', 'Embroidered', 'Jacquard']

interface Props {
  searchParams: Promise<{ pattern?: string; dealer?: string; brand?: string; filter?: string; added?: string }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const { pattern, dealer, brand, filter, added } = await searchParams

  const activePattern = PATTERNS.find(p => p === pattern) ?? null
  const isLowFilter   = filter === 'low'
  const dateFrom      = getDateFrom(added ?? null)
  const dateTo        = getDateTo(added ?? null)

  const conditions = [
    activePattern ? eq(fabrics.pattern, activePattern)              : undefined,
    dealer        ? ilike(fabrics.dealerName, `%${dealer}%`)        : undefined,
    brand         ? ilike(fabrics.brand,      `%${brand}%`)         : undefined,
    dateFrom      ? gte(fabrics.createdAt, new Date(dateFrom))      : undefined,
    dateTo        ? lt(fabrics.createdAt,  new Date(dateTo))        : undefined,
    isLowFilter
      ? sql`${fabrics.availableMeters}::numeric < ${fabrics.totalMeters}::numeric * 0.2`
      : undefined,
  ].filter(Boolean) as Parameters<typeof and>

  const where = conditions.length ? and(...conditions) : undefined

  const [allFabrics, dealers, brands, lowCount] = await Promise.all([
    db.select().from(fabrics).where(where).orderBy(asc(fabrics.brand)),
    db.select({ v: fabrics.dealerName }).from(fabrics).groupBy(fabrics.dealerName).orderBy(asc(fabrics.dealerName)),
    db.select({ v: fabrics.brand }).from(fabrics).groupBy(fabrics.brand).orderBy(asc(fabrics.brand)),
    db.$count(fabrics, sql`${fabrics.availableMeters}::numeric < ${fabrics.totalMeters}::numeric * 0.2`),
  ])

  const total = allFabrics.length

  return (
    <div className="py-6 flex flex-col gap-4 max-w-lg mx-auto">

      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
          Stock
        </h1>
        <div className="flex items-center gap-2">
          {lowCount > 0 && !isLowFilter && (
            <span className="text-[11px] font-bold text-white bg-[#ba1a1a] px-2.5 py-1 rounded-full">
              {lowCount} low
            </span>
          )}
          <span className="text-[12px] font-semibold text-[#45464d]">{total} total</span>
        </div>
      </div>

      <InventoryFilters
        dealers={dealers.map(d => d.v)}
        brands={brands.map(b => b.v)}
      />

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 rounded-full bg-[#e5eeff] flex items-center justify-center">
            <Package size={28} className="text-[#45464d]" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
              {isLowFilter ? 'No low-stock items' : 'No fabrics found'}
            </p>
            <p className="text-[13px] text-[#45464d] mt-1">
              {isLowFilter ? 'All fabrics are well-stocked.' : 'Try adjusting your filters.'}
            </p>
          </div>
          {!isLowFilter && !activePattern && !dealer && !brand && !dateFrom && (
            <CreateFabricSheet variant="inline" />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {allFabrics.map(f => <FabricCard key={f.id} fabric={f} />)}
        </div>
      )}

      <CreateFabricSheet variant="fab" />
    </div>
  )
}
