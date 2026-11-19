import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { ArrowLeft, Package } from 'lucide-react'
import { db } from '@/db'
import { fabrics } from '@/db/schema'
import EditFabricSheet from '@/components/inventory/EditFabricSheet'
import FabricQRCode from '@/components/inventory/FabricQRCode'
import DeleteFabricButton from './_components/DeleteFabricButton'
import CopyCodeButton from './_components/CopyCodeButton'

interface Props {
  params: Promise<{ id: string }>
}

const PATTERN_COLORS: Record<string, string> = {
  Plain:       'bg-brand-tint text-info-ink',
  Printed:     'bg-accent-tint text-accent-ink',
  Chequered:   'bg-info-tint text-info-ink',
  Striped:     'bg-plum-tint text-plum-ink',
  Dotted:      'bg-rose-tint text-rose-ink',
  Embroidered: 'bg-success-tint text-success',
  Jacquard:    'bg-danger-tint text-danger-ink',
}

export default async function FabricDetailPage({ params }: Props) {
  const { id } = await params
  const fabric = await db.query.fabrics.findFirst({ where: eq(fabrics.id, id) })
  if (!fabric) notFound()

  const available     = parseFloat(fabric.availableMeters)
  const total         = parseFloat(fabric.totalMeters)
  const purchasePrice = parseFloat(fabric.purchasePricePerMeter)
  const factor        = parseFloat(fabric.sellingPriceFactor)
  const sellingPrice  = purchasePrice * factor
  const pct           = total > 0 ? Math.round((available / total) * 100) : 0
  const isLow         = available < total * 0.2
  const updatedAt     = new Date(fabric.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="pb-10 flex flex-col gap-4 max-w-lg mx-auto">

      {/* Hero */}
      <div className="bg-gradient-to-b from-brand to-brand-deep rounded-b-[32px] px-5 pt-5 pb-7">
        <div className="flex items-center justify-between mb-6">
          <Link href="/inventory" className="flex items-center gap-2 text-white/70 active:scale-95 transition-transform">
            <ArrowLeft size={20} />
            <span className="text-[14px] font-medium">Stock</span>
          </Link>
          <EditFabricSheet fabric={fabric} variant="dark" />
        </div>

        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="w-[56px] h-[56px] rounded-[18px] bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Package size={24} className="text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[22px] font-bold text-white leading-tight truncate" style={{ fontFamily: 'var(--font-manrope)' }}>
              {fabric.brand}
            </p>
            <p className="text-[13px] text-white/50 mt-0.5">Dealer : {fabric.dealerName}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PATTERN_COLORS[fabric.pattern] ?? ''}`}>
                {fabric.pattern}
              </span>
              <span className="text-[12px] text-white/60">{fabric.color}</span>
            </div>
          </div>
        </div>

        {/* Code + Copy */}
        <div className="mt-5 flex items-center justify-between bg-white/8 rounded-2xl px-4 py-3 gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">Fabric Code</p>
            <p className="text-[22px] font-mono font-bold text-white tracking-widest mt-0.5 truncate">{fabric.code}</p>
          </div>
          <CopyCodeButton code={fabric.code} />
        </div>

        {/* Stock bar */}
        <div className="mt-3 bg-white/8 rounded-2xl px-4 py-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Stock</span>
            {isLow && (
              <span className="text-[11px] font-bold text-white bg-danger px-2.5 py-0.5 rounded-full animate-pulse">
                Low Stock
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[30px] font-bold text-white leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>
              {available.toFixed(2)}
            </p>
            <span className="text-[14px] text-white/50">/ {total.toFixed(2)} m · {pct}% left</span>
          </div>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isLow ? 'bg-danger-soft' : 'bg-white/70'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mx-4 bg-white rounded-[20px] border border-line/40 shadow-sm p-5">
        <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-4">Pricing</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-canvas rounded-xl p-3 text-center">
            <p className="text-[10px] text-ink-muted font-medium mb-1">Buy</p>
            <p className="text-[18px] font-bold text-ink leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>₹{purchasePrice.toFixed(0)}</p>
            <p className="text-[10px] text-ink-muted mt-1">/ metre</p>
          </div>
          <p className="text-[15px] text-line font-bold">×</p>
          <div className="flex-1 bg-canvas rounded-xl p-3 text-center">
            <p className="text-[10px] text-ink-muted font-medium mb-1">Factor</p>
            <p className="text-[18px] font-bold text-ink leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>{factor.toFixed(2)}</p>
            <p className="text-[10px] text-transparent mt-1">·</p>
          </div>
          <p className="text-[15px] text-line font-bold">=</p>
          <div className="flex-1 bg-brand-tint rounded-xl p-3 text-center">
            <p className="text-[10px] text-info-ink font-medium mb-1">Sell</p>
            <p className="text-[18px] font-bold text-ink leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>₹{sellingPrice.toFixed(0)}</p>
            <p className="text-[10px] text-ink-muted mt-1">/ metre</p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="mx-4 bg-white rounded-[20px] border border-line/40 shadow-sm p-5">
        <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase mb-1">QR Code</p>
        <p className="text-[12px] text-ink-muted mb-4">Print & stick on the fabric bolt for quick scanning.</p>
        <FabricQRCode fabricId={fabric.id} label={`${fabric.brand} · ${fabric.color} · ${fabric.pattern}`} code={fabric.code} />
      </div>

      {/* Meta */}
      <div className="mx-4 flex items-center justify-between px-5 py-3 bg-white rounded-[16px] border border-line/40">
        <span className="text-[13px] text-ink-soft">Last updated</span>
        <span className="text-[13px] font-semibold text-ink">{updatedAt}</span>
      </div>

      {/* Delete */}
      <div className="mx-4">
        <DeleteFabricButton fabricId={fabric.id} />
      </div>

    </div>
  )
}
