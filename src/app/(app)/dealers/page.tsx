import { ilike, eq, sql } from 'drizzle-orm'
import { Store } from 'lucide-react'
import { Suspense } from 'react'
import { db } from '@/db'
import { dealers, dealerLedgerEntries } from '@/db/schema'
import DealerList from '@/components/dealers/DealerList'
import DealerSearchBar from './_components/DealerSearchBar'
import CreateDealerSheet from '@/components/dealers/CreateDealerSheet'
import { DEALERS_PAGE_SIZE } from './constants'
import type { DealerWithBalance } from './actions'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function DealersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const where = query ? ilike(dealers.name, `%${query}%`) : undefined

  const [initialDealers, [{ count }]] = await Promise.all([
    db
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
      .orderBy(dealers.name)
      .limit(DEALERS_PAGE_SIZE) as Promise<DealerWithBalance[]>,
    db.select({ count: sql<number>`COUNT(*)` }).from(dealers).where(where),
  ])

  const total = Number(count)

  return (
    <div className="py-6 flex flex-col gap-4 max-w-lg mx-auto">

      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
          Dealers
        </h1>
        <span className="text-[12px] font-semibold text-[#45464d]">
          {total} {query ? 'found' : 'total'}
        </span>
      </div>

      <Suspense>
        <DealerSearchBar defaultValue={query} />
      </Suspense>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="w-16 h-16 rounded-full bg-[#f5f0e8] flex items-center justify-center">
            <Store size={28} className="text-[#775a19]" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
              {query ? `No dealer named "${query}"` : 'No dealers yet'}
            </p>
            <p className="text-[13px] text-[#45464d] mt-1">
              {query ? 'Add them now to start tracking their account.' : 'Add your first dealer to track purchases & payments.'}
            </p>
          </div>
          {query
            ? <CreateDealerSheet variant="inline" initialName={query} />
            : <CreateDealerSheet variant="inline" />}
        </div>
      ) : (
        <DealerList
          key={query}
          initialDealers={initialDealers}
          total={total}
          query={query}
        />
      )}

      <CreateDealerSheet variant="fab" />

    </div>
  )
}
