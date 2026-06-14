import type { DealerLedgerEntry } from '@/db/schema'

type EntryWithBalance = DealerLedgerEntry & { runningBalance: number }

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Math.abs(n))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

const th = 'text-[10px] font-semibold tracking-widest uppercase text-[#45464d] px-3 py-2.5 text-left whitespace-nowrap'
const td = 'px-3 py-2.5 text-[12px] text-[#0b1c30] whitespace-nowrap'

export default function LedgerTable({ entries }: { entries: EntryWithBalance[] }) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-[20px] border border-[#c6c6cd]/30 px-5 py-12 flex flex-col items-center gap-2">
        <p className="text-[15px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>No entries yet</p>
        <p className="text-[13px] text-[#76777d]">Tap + to add your first credit or debit entry.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] border border-[#c6c6cd]/30 shadow-[0px_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 620 }}>
          <thead>
            <tr className="bg-[#f8f9ff] border-b border-[#c6c6cd]/40">
              <th className={th}>Date</th>
              <th className={`${th} max-w-[140px]`}>Particulars</th>
              <th className={th}>V.Type</th>
              <th className={th}>V.No</th>
              <th className={`${th} text-right`}>Debit</th>
              <th className={`${th} text-right`}>Credit</th>
              <th className={`${th} text-right`}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const isCredit = entry.creditAmount !== null
              const amount = isCredit
                ? parseFloat(entry.creditAmount!)
                : parseFloat(entry.debitAmount!)
              const bal = entry.runningBalance

              return (
                <tr key={entry.id} className={`border-b border-[#c6c6cd]/20 ${i % 2 === 1 ? 'bg-[#f8f9ff]/50' : ''}`}>
                  <td className={td}>{fmtDate(entry.billDate)}</td>
                  <td className={`${td} max-w-[140px]`}>
                    <span className="block truncate max-w-[130px]" title={entry.particulars}>{entry.particulars}</span>
                    <span className="text-[10px] text-[#76777d]">{entry.voucherNo}</span>
                  </td>
                  <td className={td}>
                    <span className="bg-[#f8f9ff] border border-[#c6c6cd]/40 rounded-md px-1.5 py-0.5 text-[11px]">
                      {entry.voucherType}
                    </span>
                  </td>
                  <td className={`${td} text-[#76777d]`}>{entry.voucherNo}</td>
                  <td className={`${td} text-right font-semibold`}>
                    {!isCredit ? <span className="text-[#1a5c34]">₹{fmt(amount)}</span> : <span className="text-[#c6c6cd]">—</span>}
                  </td>
                  <td className={`${td} text-right font-semibold`}>
                    {isCredit ? <span className="text-[#ba1a1a]">₹{fmt(amount)}</span> : <span className="text-[#c6c6cd]">—</span>}
                  </td>
                  <td className={`${td} text-right font-bold`}>
                    <span className={bal > 0 ? 'text-[#ba1a1a]' : bal < 0 ? 'text-[#1a5c34]' : 'text-[#76777d]'}>
                      ₹{fmt(bal)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#f8f9ff] border-t-2 border-[#c6c6cd]/60">
              <td colSpan={4} className={`${td} font-bold text-[#0b1c30]`}>Closing Balance</td>
              <td className={`${td} text-right font-bold text-[#1a5c34]`}>
                ₹{fmt(entries.reduce((s, e) => s + (e.debitAmount ? parseFloat(e.debitAmount) : 0), 0))}
              </td>
              <td className={`${td} text-right font-bold text-[#ba1a1a]`}>
                ₹{fmt(entries.reduce((s, e) => s + (e.creditAmount ? parseFloat(e.creditAmount) : 0), 0))}
              </td>
              <td className={`${td} text-right font-bold`}>
                {(() => {
                  const fin = entries[entries.length - 1].runningBalance
                  return <span className={fin > 0 ? 'text-[#ba1a1a]' : fin < 0 ? 'text-[#1a5c34]' : 'text-[#76777d]'}>₹{fmt(fin)}</span>
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
