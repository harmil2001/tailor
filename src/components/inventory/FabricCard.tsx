import Link from 'next/link'
import type { Fabric } from '@/db/schema'

const PATTERN_COLORS: Record<string, string> = {
  Plain:      'bg-[#e5eeff] text-[#1a3a8f]',
  Printed:    'bg-[#fed488] text-[#785a1a]',
  Chequered:  'bg-[#d3e4fe] text-[#0040a0]',
  Striped:    'bg-[#f3e8ff] text-[#6b21a8]',
  Dotted:     'bg-[#fce7f3] text-[#9d174d]',
  Embroidered:'bg-[#d6f5e3] text-[#1a5c34]',
  Jacquard:   'bg-[#ffdad6] text-[#93000a]',
}

function StockBar({ available, total }: { available: number; total: number }) {
  const pct      = total > 0 ? Math.min((available / total) * 100, 100) : 0
  const isLow    = available < total * 0.2
  const barColor = isLow ? 'bg-[#ba1a1a]' : 'bg-[#775a19]'
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-medium text-[#76777d]">
          {parseFloat(available.toFixed(3))} m left of {parseFloat(total.toFixed(3))} m
        </span>
        {isLow && (
          <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
            Low Stock
          </span>
        )}
      </div>
      <div className="h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function FabricCard({ fabric }: { fabric: Fabric }) {
  const available    = parseFloat(fabric.availableMeters)
  const total        = parseFloat(fabric.totalMeters)
  const purchasePrice = parseFloat(fabric.purchasePricePerMeter)
  const factor       = parseFloat(fabric.sellingPriceFactor)
  const sellingPrice = purchasePrice * factor
  const isLow        = available < total * 0.2

  return (
    <Link href={`/inventory/${fabric.id}`}>
      <div className={`bg-white rounded-[24px] border shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-5 active:scale-[0.98] transition-all ${isLow ? 'border-[#ba1a1a]/30' : 'border-[#c6c6cd]/40'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-[#0b1c30] truncate" style={{ fontFamily: 'var(--font-manrope)' }}>
              {fabric.brand}
            </p>
            <p className="text-[12px] text-[#76777d] mt-0.5">{fabric.dealerName}</p>
          </div>
          <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${PATTERN_COLORS[fabric.pattern] ?? 'bg-[#e5eeff] text-[#45464d]'}`}>
            {fabric.pattern}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="w-4 h-4 rounded-full border border-[#c6c6cd] flex-shrink-0" style={{ backgroundColor: fabric.color.toLowerCase() }} />
          <span className="text-[13px] text-[#45464d]">{fabric.color}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-[#f8f9ff] rounded-xl px-3 py-2">
            <p className="text-[10px] text-[#76777d] font-medium">Buy Price</p>
            <p className="text-[14px] font-bold text-[#0b1c30]">₹{purchasePrice.toFixed(0)}/m</p>
          </div>
          <div className="bg-[#f8f9ff] rounded-xl px-3 py-2">
            <p className="text-[10px] text-[#76777d] font-medium">Sell Price</p>
            <p className="text-[14px] font-bold text-[#775a19]">₹{sellingPrice.toFixed(0)}/m</p>
          </div>
        </div>

        <StockBar available={available} total={total} />
      </div>
    </Link>
  )
}
