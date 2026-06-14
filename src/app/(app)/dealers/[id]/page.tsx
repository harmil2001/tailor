import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { dealers, dealerLedgerEntries } from '@/db/schema'
import LedgerSummaryCards from './_components/LedgerSummaryCards'
import LedgerTable from './_components/LedgerTable'
import AddLedgerEntrySheet from '@/components/dealers/AddLedgerEntrySheet'
import type { DealerLedgerEntry } from '@/db/schema'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DealerDetailPage({ params }: Props) {
  const { id } = await params

  const [dealer, entries] = await Promise.all([
    db.query.dealers.findFirst({ where: eq(dealers.id, id) }),
    db
      .select()
      .from(dealerLedgerEntries)
      .where(eq(dealerLedgerEntries.dealerId, id))
      .orderBy(asc(dealerLedgerEntries.billDate), asc(dealerLedgerEntries.createdAt)),
  ])

  if (!dealer) notFound()

  let runningBalance = 0
  const entriesWithBalance = (entries as DealerLedgerEntry[]).map(entry => {
    if (entry.creditAmount) runningBalance += parseFloat(entry.creditAmount)
    if (entry.debitAmount) runningBalance -= parseFloat(entry.debitAmount)
    return { ...entry, runningBalance }
  })

  const totalCredit = entries.reduce((s, e) => s + (e.creditAmount ? parseFloat(e.creditAmount) : 0), 0)
  const totalDebit  = entries.reduce((s, e) => s + (e.debitAmount  ? parseFloat(e.debitAmount)  : 0), 0)

  return (
    <div className="py-6 flex flex-col gap-4 max-w-lg mx-auto">

      <div className="flex items-center gap-3">
        <Link href="/dealers" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f8f9ff] border border-[#c6c6cd]/40 active:scale-95 transition-transform">
          <ChevronLeft size={18} className="text-[#45464d]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold text-[#0b1c30] truncate" style={{ fontFamily: 'var(--font-manrope)' }}>
            {dealer.name}
          </h1>
          <p className="text-[12px] text-[#76777d]">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
        </div>
      </div>

      <LedgerSummaryCards totalCredit={totalCredit} totalDebit={totalDebit} />

      <div>
        <h2 className="text-[13px] font-semibold tracking-widest uppercase text-[#45464d] mb-3">Ledger</h2>
        <LedgerTable entries={entriesWithBalance} />
      </div>

      <AddLedgerEntrySheet dealerId={id} />

    </div>
  )
}
