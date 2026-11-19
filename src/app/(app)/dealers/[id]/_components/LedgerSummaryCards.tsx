import { fmtINR } from '@/lib/formatINR'

interface Props {
  totalCredit: number
  totalDebit: number
}

export default function LedgerSummaryCards({ totalCredit, totalDebit }: Props) {
  const outstanding = totalCredit - totalDebit
  const isOwed = outstanding > 0

  return (
    <div className="flex flex-col gap-3">

      <div className={`rounded-[20px] px-5 py-4 ${isOwed ? 'bg-danger-tint' : outstanding < 0 ? 'bg-success-tint' : 'bg-canvas border border-line/40'}`}>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-ink-soft mb-1">
          {isOwed ? 'Outstanding (We Owe)' : outstanding < 0 ? 'Advance / Overpaid' : 'Account Settled'}
        </p>
        <p className={`text-[28px] font-bold ${isOwed ? 'text-danger-ink' : outstanding < 0 ? 'text-success' : 'text-ink'}`} style={{ fontFamily: 'var(--font-manrope)' }}>
          {fmtINR(Math.abs(outstanding))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[16px] border border-line/30 shadow-[0px_2px_8px_rgba(15,23,42,0.06)] px-4 py-3.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-ink-muted mb-1">Total Credit</p>
          <p className="text-[18px] font-bold text-danger" style={{ fontFamily: 'var(--font-manrope)' }}>{fmtINR(totalCredit)}</p>
          <p className="text-[10px] text-ink-muted mt-0.5">Purchases / Bills</p>
        </div>
        <div className="bg-white rounded-[16px] border border-line/30 shadow-[0px_2px_8px_rgba(15,23,42,0.06)] px-4 py-3.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-ink-muted mb-1">Total Debit</p>
          <p className="text-[18px] font-bold text-success" style={{ fontFamily: 'var(--font-manrope)' }}>{fmtINR(totalDebit)}</p>
          <p className="text-[10px] text-ink-muted mt-0.5">Payments Made</p>
        </div>
      </div>

    </div>
  )
}
