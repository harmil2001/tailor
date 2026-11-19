import Link from 'next/link'
import type { Fabric } from '@/db/schema'

const PATTERN_STYLE: Record<string, { header: string; chip: string }> = {
  Plain:       { header: 'bg-brand-tint', chip: 'bg-brand-tint-strong text-info-ink' },
  Printed:     { header: 'bg-accent-tint', chip: 'bg-accent-tint-strong text-accent-ink' },
  Chequered:   { header: 'bg-info-tint', chip: 'bg-info-tint-strong text-info-ink' },
  Striped:     { header: 'bg-plum-tint', chip: 'bg-plum-tint-strong text-plum-ink' },
  Dotted:      { header: 'bg-rose-tint', chip: 'bg-rose-tint-strong text-rose-ink' },
  Embroidered: { header: 'bg-success-tint', chip: 'bg-success-tint-strong text-success' },
  Jacquard:    { header: 'bg-danger-tint', chip: 'bg-danger-tint-strong text-danger-ink' },
}

export default function FabricCard({ fabric }: { fabric: Fabric }) {
  const available    = parseFloat(fabric.availableMeters)
  const total        = parseFloat(fabric.totalMeters)
  const sellingPrice = parseFloat(fabric.purchasePricePerMeter) * parseFloat(fabric.sellingPriceFactor)
  const isLow        = available < total * 0.2
  const pct          = total > 0 ? Math.min((available / total) * 100, 100) : 0
  const style        = PATTERN_STYLE[fabric.pattern] ?? { header: 'bg-brand-tint', chip: 'bg-brand-tint-strong text-ink-soft' }

  const addedDate = new Date(fabric.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link href={`/inventory/${fabric.id}`}>
      <div className={`rounded-[24px] border overflow-hidden shadow-[0px_4px_12px_rgba(15,23,42,0.06)] active:scale-[0.98] transition-all ${isLow ? 'border-danger/30' : 'border-line/20'}`}>

        {/* Tinted header */}
        <div className={`${style.header} px-5 pt-4 pb-4`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[18px] font-semibold text-ink truncate leading-snug" style={{ fontFamily: 'var(--font-manrope)' }}>
              {fabric.brand}
            </p>
            <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${style.chip}`}>
              {fabric.pattern}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-semibold text-ink-soft bg-white/60 px-2.5 py-0.5 rounded-full">
              {fabric.color}
            </span>
            <span className="text-[11px] font-mono font-bold text-ink-soft bg-white/80 px-2.5 py-0.5 rounded-full tracking-widest border border-black/10">
              {fabric.code}
            </span>
          </div>
        </div>

        {/* White body */}
        <div className="bg-white px-5 pt-4 pb-5">

          {/* Stock label + low badge */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[14px] font-semibold text-ink">
              {parseFloat(available.toFixed(1))}m
              <span className="text-[12px] font-normal text-ink-muted"> of {parseFloat(total.toFixed(1))}m</span>
            </span>
            {isLow ? (
              <span className="text-[10px] font-bold text-danger bg-danger-tint px-2 py-0.5 rounded-full">
                Low Stock
              </span>
            ) : (
              <span className="text-[11px] text-ink-muted">{Math.round(pct)}%</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isLow ? 'bg-danger' : 'bg-accent'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-[13px] font-medium text-ink">Dealer: {fabric.dealerName}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Added {addedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-widest text-ink-soft uppercase">Sell</p>
              <p className="text-[18px] font-bold text-accent leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                ₹{sellingPrice.toFixed(0)}<span className="text-[11px] font-normal text-ink-muted">/m</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </Link>
  )
}
