'use client'

import { X } from 'lucide-react'
import FabricPicker, { type FabricSelection } from './FabricPicker'
import type { ClothProvidedBy, Fabric } from '@/db/schema'

export type OrderItemState = {
  name: string
  clothProvidedBy: ClothProvidedBy
  fabricSelection: FabricSelection | null
}

export default function OrderItemRow({ item, showRemove, fabrics, onChange, onRemove }: {
  item: OrderItemState
  showRemove: boolean
  fabrics: Fabric[]
  onChange: (updated: OrderItemState) => void
  onRemove: () => void
}) {
  function setCloth(opt: ClothProvidedBy) {
    onChange({ ...item, clothProvidedBy: opt, fabricSelection: opt === 'Customer' ? null : item.fabricSelection })
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={item.name}
          onChange={e => onChange({ ...item, name: e.target.value })}
          placeholder="e.g. Kurta, Suit, Shirt…"
          className="flex-1 h-11 px-3 bg-white border border-[#c6c6cd] rounded-lg text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors"
        />
        {showRemove && (
          <button onClick={onRemove} className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#ffdad6] text-[#93000a] flex-shrink-0">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-widest text-[#45464d] uppercase">Cloth</span>
        <div className="flex gap-1.5">
          {(['Customer', 'Tailor'] as const).map(opt => (
            <button key={opt} onClick={() => setCloth(opt)}
              className={`px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors ${item.clothProvidedBy === opt ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd] text-[#45464d]'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {item.clothProvidedBy === 'Tailor' && (
        <FabricPicker
          fabrics={fabrics}
          value={item.fabricSelection}
          onChange={sel => onChange({ ...item, fabricSelection: sel })}
        />
      )}
    </div>
  )
}
