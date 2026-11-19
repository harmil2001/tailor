'use client'

import { X } from 'lucide-react'
import FabricPicker, { type FabricSelection } from './FabricPicker'
import type { ClothProvidedBy, Fabric } from '@/db/schema'
import { FEATURES } from '@/lib/features'

export type OrderItemState = {
  name: string
  clothProvidedBy: ClothProvidedBy
  fabricType: 'lot' | 'loose' | null
  fabricSelection: FabricSelection | null
  loosePieceNote: string
}

export default function OrderItemRow({ item, showRemove, fabrics, onChange, onRemove }: {
  item: OrderItemState
  showRemove: boolean
  fabrics: Fabric[]
  onChange: (updated: OrderItemState) => void
  onRemove: () => void
}) {
  function setCloth(opt: ClothProvidedBy) {
    onChange({ ...item, clothProvidedBy: opt, fabricType: null, fabricSelection: null })
  }

  function setFabricType(type: 'lot' | 'loose') {
    onChange({ ...item, fabricType: type, fabricSelection: null })
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-canvas border border-line rounded-xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={item.name}
          onChange={e => onChange({ ...item, name: e.target.value })}
          placeholder="e.g. Kurta, Suit, Shirt…"
          className="flex-1 h-11 px-3 bg-white border border-line rounded-lg text-[14px] text-ink focus:outline-none focus:border-brand transition-colors"
        />
        {showRemove && (
          <button onClick={onRemove} className="w-11 h-11 flex items-center justify-center rounded-lg bg-danger-tint text-danger-ink flex-shrink-0">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Cloth provider — hidden while FEATURES.clothChoice is off (always Customer) */}
      {FEATURES.clothChoice && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">Cloth</span>
          <div className="flex gap-1.5">
            {(['Customer', 'Tailor'] as const).map(opt => (
              <button key={opt} onClick={() => setCloth(opt)}
                className={`px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors ${item.clothProvidedBy === opt ? 'bg-brand text-white' : 'bg-white border border-line text-ink-soft'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fabric type — only when tailor provides */}
      {item.clothProvidedBy === 'Tailor' && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">Type</span>
          <div className="flex gap-1.5">
            {FEATURES.stock && (
              <button onClick={() => setFabricType('lot')}
                className={`px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors ${item.fabricType === 'lot' ? 'bg-brand text-white' : 'bg-white border border-line text-ink-soft'}`}
              >
                From Lot
              </button>
            )}
            <button onClick={() => setFabricType('loose')}
              className={`px-3 h-7 rounded-lg text-[11px] font-semibold transition-colors ${item.fabricType === 'loose' ? 'bg-brand text-white' : 'bg-white border border-line text-ink-soft'}`}
            >
              Loose Piece
            </button>
          </div>
        </div>
      )}

      {/* Lot picker */}
      {FEATURES.stock && item.clothProvidedBy === 'Tailor' && item.fabricType === 'lot' && (
        <FabricPicker
          fabrics={fabrics}
          value={item.fabricSelection}
          onChange={sel => onChange({ ...item, fabricSelection: sel })}
        />
      )}

      {/* Loose piece — free text description */}
      {item.clothProvidedBy === 'Tailor' && item.fabricType === 'loose' && (
        <input
          type="text"
          value={item.loosePieceNote}
          onChange={e => onChange({ ...item, loosePieceNote: e.target.value })}
          placeholder="Describe fabric — e.g. Navy Blue Plain Cotton"
          className="w-full h-10 px-3 bg-white border border-line rounded-lg text-[13px] text-ink focus:outline-none focus:border-brand transition-colors"
        />
      )}
    </div>
  )
}
