function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
}

interface Props {
  totalCredit: number
  totalDebit: number
}

export default function LedgerSummaryCards({ totalCredit, totalDebit }: Props) {
  const outstanding = totalCredit - totalDebit
  const isOwed = outstanding > 0

  return (
    <div className="flex flex-col gap-3">

      <div className={`rounded-[20px] px-5 py-4 ${isOwed ? 'bg-[#ffdad6]' : outstanding < 0 ? 'bg-[#d6f5e3]' : 'bg-[#f8f9ff] border border-[#c6c6cd]/40'}`}>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#45464d] mb-1">
          {isOwed ? 'Outstanding (We Owe)' : outstanding < 0 ? 'Advance / Overpaid' : 'Account Settled'}
        </p>
        <p className={`text-[28px] font-bold ${isOwed ? 'text-[#93000a]' : outstanding < 0 ? 'text-[#1a5c34]' : 'text-[#0b1c30]'}`} style={{ fontFamily: 'var(--font-manrope)' }}>
          ₹{fmt(Math.abs(outstanding))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[16px] border border-[#c6c6cd]/30 shadow-[0px_2px_8px_rgba(15,23,42,0.06)] px-4 py-3.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#76777d] mb-1">Total Credit</p>
          <p className="text-[18px] font-bold text-[#ba1a1a]" style={{ fontFamily: 'var(--font-manrope)' }}>₹{fmt(totalCredit)}</p>
          <p className="text-[10px] text-[#76777d] mt-0.5">Purchases / Bills</p>
        </div>
        <div className="bg-white rounded-[16px] border border-[#c6c6cd]/30 shadow-[0px_2px_8px_rgba(15,23,42,0.06)] px-4 py-3.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#76777d] mb-1">Total Debit</p>
          <p className="text-[18px] font-bold text-[#1a5c34]" style={{ fontFamily: 'var(--font-manrope)' }}>₹{fmt(totalDebit)}</p>
          <p className="text-[10px] text-[#76777d] mt-0.5">Payments Made</p>
        </div>
      </div>

    </div>
  )
}
