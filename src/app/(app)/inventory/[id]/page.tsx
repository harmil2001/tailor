import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { ArrowLeft, Package } from 'lucide-react'
import { db } from '@/db'
import { fabrics } from '@/db/schema'
import EditFabricSheet from '@/components/inventory/EditFabricSheet'
import FabricQRCode from '@/components/inventory/FabricQRCode'
import DeleteFabricButton from './_components/DeleteFabricButton'

interface Props {
  params: Promise<{ id: string }>
}

const PATTERN_COLORS: Record<string, string> = {
  Plain:      'bg-[#e5eeff] text-[#1a3a8f]',
  Printed:    'bg-[#fed488] text-[#785a1a]',
  Chequered:  'bg-[#d3e4fe] text-[#0040a0]',
  Striped:    'bg-[#f3e8ff] text-[#6b21a8]',
  Dotted:     'bg-[#fce7f3] text-[#9d174d]',
  Embroidered:'bg-[#d6f5e3] text-[#1a5c34]',
  Jacquard:   'bg-[#ffdad6] text-[#93000a]',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[#c6c6cd]/40 last:border-0">
      <span className="text-[13px] text-[#45464d]">{label}</span>
      <span className="text-[14px] font-semibold text-[#0b1c30]">{value}</span>
    </div>
  )
}

export default async function FabricDetailPage({ params }: Props) {
  const { id } = await params

  const fabric = await db.query.fabrics.findFirst({ where: eq(fabrics.id, id) })
  if (!fabric) notFound()

  const available    = parseFloat(fabric.availableMeters)
  const total        = parseFloat(fabric.totalMeters)
  const purchasePrice = parseFloat(fabric.purchasePricePerMeter)
  const factor       = parseFloat(fabric.sellingPriceFactor)
  const sellingPrice = purchasePrice * factor
  const pct          = total > 0 ? Math.round((available / total) * 100) : 0
  const isLow        = available < total * 0.2
  const updatedAt    = new Date(fabric.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="pb-10 flex flex-col gap-4 max-w-lg mx-auto">

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0b1c30] to-[#1c3554] rounded-b-[32px] px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-7">
          <Link href="/inventory" className="flex items-center gap-2 text-white/70 active:scale-95 transition-transform">
            <ArrowLeft size={20} />
            <span className="text-[14px] font-medium">Stock</span>
          </Link>
          <EditFabricSheet fabric={fabric} variant="dark" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-[72px] h-[72px] rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center">
            <Package size={30} className="text-white/70" />
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              {fabric.brand}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[12px] text-white/50">{fabric.dealerName}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PATTERN_COLORS[fabric.pattern] ?? ''}`}>
                {fabric.pattern}
              </span>
            </div>
          </div>
        </div>

        {/* Stock bar */}
        <div className="mt-5 bg-white/8 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-semibold text-white/60 uppercase tracking-widest">Stock Level</span>
            {isLow && (
              <span className="text-[11px] font-bold text-white bg-[#ba1a1a] px-2.5 py-1 rounded-full animate-pulse">
                Low Stock
              </span>
            )}
          </div>
          <p className="text-[28px] font-bold text-white leading-none" style={{ fontFamily: 'var(--font-manrope)' }}>
            {available.toFixed(2)}m
          </p>
          <p className="text-[12px] text-white/40 mt-0.5">of {total.toFixed(2)}m total · {pct}% remaining</p>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isLow ? 'bg-[#ff8a80]' : 'bg-white/70'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="mx-4 bg-white rounded-[20px] border border-[#c6c6cd]/40 shadow-sm px-5 py-1">
        <Row label="Color"             value={fabric.color} />
        <Row label="Buy Price"         value={`₹${purchasePrice.toFixed(2)} / metre`} />
        <Row label="Sell Factor"       value={`×${factor.toFixed(2)}`} />
        <Row label="Sell Price"        value={`₹${sellingPrice.toFixed(2)} / metre`} />
        <Row label="Total Received"    value={`${total.toFixed(2)} m`} />
        <Row label="Available"         value={`${available.toFixed(2)} m`} />
        <Row label="Last Updated"      value={updatedAt} />
      </div>

      {/* QR Code */}
      <div className="mx-4 bg-white rounded-[20px] border border-[#c6c6cd]/40 shadow-sm p-5">
        <p className="text-[11px] font-semibold tracking-widest text-[#45464d] uppercase mb-4">QR Code</p>
        <FabricQRCode fabricId={fabric.id} label={`${fabric.brand}-${fabric.color}`} />
      </div>

      {/* Delete */}
      <div className="mx-4">
        <DeleteFabricButton fabricId={fabric.id} />
      </div>

    </div>
  )
}
