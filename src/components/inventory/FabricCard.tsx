import Link from 'next/link'
import type { Fabric } from '@/db/schema'

const PATTERN_STYLE: Record<string, { header: string; chip: string }> = {
  Plain:       { header: 'bg-[#e5eeff]', chip: 'bg-[#c8d8ff] text-[#1a3a8f]' },
  Printed:     { header: 'bg-[#fdefc8]', chip: 'bg-[#f8d98a] text-[#785a1a]' },
  Chequered:   { header: 'bg-[#d3e4fe]', chip: 'bg-[#b8d0fc] text-[#0040a0]' },
  Striped:     { header: 'bg-[#f3e8ff]', chip: 'bg-[#e4d0ff] text-[#6b21a8]' },
  Dotted:      { header: 'bg-[#fce7f3]', chip: 'bg-[#f8cce4] text-[#9d174d]' },
  Embroidered: { header: 'bg-[#d6f5e3]', chip: 'bg-[#b4eccc] text-[#1a5c34]' },
  Jacquard:    { header: 'bg-[#ffdad6]', chip: 'bg-[#ffb4ae] text-[#93000a]' },
}

export default function FabricCard({ fabric }: { fabric: Fabric }) {
  const available    = parseFloat(fabric.availableMeters)
  const total        = parseFloat(fabric.totalMeters)
  const sellingPrice = parseFloat(fabric.purchasePricePerMeter) * parseFloat(fabric.sellingPriceFactor)
  const isLow        = available < total * 0.2
  const pct          = total > 0 ? Math.min((available / total) * 100, 100) : 0
  const style        = PATTERN_STYLE[fabric.pattern] ?? { header: 'bg-[#e5eeff]', chip: 'bg-[#c8d8ff] text-[#45464d]' }

  const addedDate = new Date(fabric.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link href={`/inventory/${fabric.id}`}>
      <div className={`rounded-[24px] border overflow-hidden shadow-[0px_4px_12px_rgba(15,23,42,0.06)] active:scale-[0.98] transition-all ${isLow ? 'border-[#ba1a1a]/30' : 'border-[#c6c6cd]/20'}`}>

        {/* Tinted header */}
        <div className={`${style.header} px-5 pt-4 pb-4`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[18px] font-semibold text-[#0b1c30] truncate leading-snug" style={{ fontFamily: 'var(--font-manrope)' }}>
              {fabric.brand}
            </p>
            <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${style.chip}`}>
              {fabric.pattern}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-semibold text-[#45464d] bg-white/60 px-2.5 py-0.5 rounded-full">
              {fabric.color}
            </span>
            <span className="text-[11px] font-mono font-bold text-[#45464d] bg-white/80 px-2.5 py-0.5 rounded-full tracking-widest border border-black/10">
              {fabric.code}
            </span>
          </div>
        </div>

        {/* White body */}
        <div className="bg-white px-5 pt-4 pb-5">

          {/* Stock label + low badge */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[14px] font-semibold text-[#0b1c30]">
              {parseFloat(available.toFixed(1))}m
              <span className="text-[12px] font-normal text-[#76777d]"> of {parseFloat(total.toFixed(1))}m</span>
            </span>
            {isLow ? (
              <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                Low Stock
              </span>
            ) : (
              <span className="text-[11px] text-[#76777d]">{Math.round(pct)}%</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isLow ? 'bg-[#ba1a1a]' : 'bg-[#775a19]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-[13px] font-medium text-[#0b1c30]">Dealer: {fabric.dealerName}</p>
              <p className="text-[11px] text-[#76777d] mt-0.5">Added {addedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-widest text-[#45464d] uppercase">Sell</p>
              <p className="text-[18px] font-bold text-[#775a19] leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                ₹{sellingPrice.toFixed(0)}<span className="text-[11px] font-normal text-[#76777d]">/m</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </Link>
  )
}
