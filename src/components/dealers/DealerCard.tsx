import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { fmtINR } from '@/lib/formatINR'
import type { DealerWithBalance } from '@/app/(app)/dealers/actions'

export default function DealerCard({ dealer }: { dealer: DealerWithBalance }) {
  const initials = dealer.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const outstanding = parseFloat(dealer.totalCredit) - parseFloat(dealer.totalDebit)
  const isOwed = outstanding > 0

  return (
    <Link href={`/dealers/${dealer.id}`}>
      <div className="bg-white rounded-[20px] border border-[#c6c6cd]/30 shadow-[0px_2px_8px_rgba(15,23,42,0.06)] flex items-center gap-4 px-4 py-3.5 active:scale-[0.98] transition-all">

        <div className="w-12 h-12 rounded-2xl bg-[#775a19] flex items-center justify-center flex-shrink-0">
          <span className="text-[15px] font-bold text-white" style={{ fontFamily: 'var(--font-manrope)' }}>
            {initials}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#0b1c30] truncate leading-snug" style={{ fontFamily: 'var(--font-manrope)' }}>
            {dealer.name}
          </p>
          <p className={`text-[12px] mt-0.5 font-semibold ${isOwed ? 'text-[#ba1a1a]' : outstanding < 0 ? 'text-[#1a5c34]' : 'text-[#76777d]'}`}>
            {outstanding === 0
              ? 'Settled'
              : isOwed
                ? `Outstanding: ${fmtINR(outstanding)}`
                : `Advance: ${fmtINR(Math.abs(outstanding))}`}
          </p>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#f8f9ff] flex items-center justify-center flex-shrink-0">
          <ChevronRight size={14} className="text-[#45464d]" />
        </div>

      </div>
    </Link>
  )
}
