'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Fabric } from '@/db/schema'

export type FabricSelection = {
  fabricId: string
  brand: string
  color: string
  availableMeters: number
  metersUsed: string
  pricePerMeter: number
}

function sellPrice(f: Fabric) {
  return parseFloat(f.purchasePricePerMeter) * parseFloat(f.sellingPriceFactor)
}

export default function FabricPicker({ fabrics, value, onChange }: {
  fabrics: Fabric[]
  value: FabricSelection | null
  onChange: (v: FabricSelection | null) => void
}) {
  const [query, setQuery] = useState('')

  function select(f: Fabric) {
    onChange({ fabricId: f.id, brand: f.brand, color: f.color, availableMeters: parseFloat(f.availableMeters), metersUsed: '', pricePerMeter: sellPrice(f) })
    setQuery('')
  }

  const noMatch = query.trim().length > 0 && !fabrics.find(f => f.code.toUpperCase() === query.trim().toUpperCase())

  if (value) {
    const meters      = parseFloat(value.metersUsed) || 0
    const fabricTotal = meters * value.pricePerMeter
    const metersOver  = !!value.metersUsed && meters > value.availableMeters
    const showCalc    = !!value.metersUsed && !metersOver && meters > 0

    return (
      <div className="mt-1 p-3 bg-white border border-[#c6c6cd] rounded-xl flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-[#0b1c30]">{value.brand} · {value.color}</p>
            <p className="text-[11px] text-[#76777d] mt-0.5">
              {value.availableMeters.toFixed(1)}m available · ₹{value.pricePerMeter.toFixed(0)}/m
            </p>
          </div>
          <button onClick={() => onChange(null)} className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f0f0f5] flex-shrink-0">
            <X size={11} className="text-[#45464d]" />
          </button>
        </div>
        <input
          type="number"
          inputMode="decimal"
          value={value.metersUsed}
          onChange={e => onChange({ ...value, metersUsed: e.target.value })}
          placeholder="Meters required"
          className={`w-full h-10 px-3 bg-[#f8f9ff] border rounded-lg text-[13px] focus:outline-none transition-colors ${metersOver ? 'border-[#ba1a1a]' : 'border-[#c6c6cd] focus:border-black'}`}
        />
        {metersOver && (
          <p className="text-[11px] text-[#ba1a1a] -mt-1">Only {value.availableMeters.toFixed(1)}m available</p>
        )}
        {showCalc && (
          <p className="text-[12px] font-semibold text-[#775a19]">
            Fabric cost: ₹{fabricTotal.toFixed(0)}
            <span className="font-normal text-[#76777d]"> ({meters}m × ₹{value.pricePerMeter.toFixed(0)}/m)</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-1">
      <input
        type="text"
        value={query}
        onChange={e => {
          const q = e.target.value
          setQuery(q)
          const match = fabrics.find(f => f.code.toUpperCase() === q.trim().toUpperCase())
          if (match) select(match)
        }}
        placeholder="Paste fabric code (e.g. FAB-001)…"
        className="w-full h-10 px-3 bg-white border border-[#c6c6cd] rounded-lg text-[13px] font-mono focus:outline-none focus:border-black transition-colors"
      />
      {noMatch && (
        <p className="mt-1.5 text-[11px] text-[#ba1a1a]">No fabric found with code &quot;{query.trim()}&quot;</p>
      )}
    </div>
  )
}
