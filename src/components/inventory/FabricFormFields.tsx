'use client'

import type { FabricPattern } from '@/db/schema'

const PATTERNS: FabricPattern[] = ['Plain', 'Printed', 'Chequered', 'Striped', 'Dotted', 'Embroidered', 'Jacquard']

export type FabricFormState = {
  brand: string
  dealerName: string
  color: string
  pattern: string
  purchasePricePerMeter: string
  sellingPriceFactor: string
  totalMeters: string
  availableMeters: string
}

const inputCls = 'w-full h-12 px-4 bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] focus:outline-none focus:border-black transition-colors'
const labelCls = 'block text-[11px] font-semibold tracking-widest text-[#45464d] uppercase mb-2'

export default function FabricFormFields({
  form,
  onChange,
}: {
  form: FabricFormState
  onChange: (f: FabricFormState) => void
}) {
  function set(key: keyof FabricFormState, value: string) {
    onChange({ ...form, [key]: value })
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5">

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Brand</label>
          <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Raymond" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Dealer</label>
          <input value={form.dealerName} onChange={e => set('dealerName', e.target.value)} placeholder="e.g. Surat Mills" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Color</label>
        <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Navy Blue" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Pattern</label>
        <div className="flex flex-wrap gap-2">
          {PATTERNS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => set('pattern', p)}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                form.pattern === p
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-[#c6c6cd] text-[#45464d]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Buy Price (₹/m)</label>
          <input type="number" inputMode="decimal" value={form.purchasePricePerMeter} onChange={e => set('purchasePricePerMeter', e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sell Factor (×)</label>
          <input type="number" inputMode="decimal" step="0.1" value={form.sellingPriceFactor} onChange={e => set('sellingPriceFactor', e.target.value)} placeholder="1.0" className={inputCls} />
          {form.purchasePricePerMeter && form.sellingPriceFactor && (
            <p className="text-[11px] text-[#76777d] mt-1">
              Sell = ₹{(Number(form.purchasePricePerMeter) * Number(form.sellingPriceFactor)).toFixed(0)}/m
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Total Metres</label>
          <input type="number" inputMode="decimal" step="0.5" value={form.totalMeters} onChange={e => set('totalMeters', e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Available Metres</label>
          <input
            type="number" inputMode="decimal" step="0.5"
            value={form.availableMeters}
            onChange={e => set('availableMeters', e.target.value)}
            placeholder="0"
            className={`${inputCls} ${form.availableMeters && form.totalMeters && Number(form.availableMeters) > Number(form.totalMeters) ? 'border-[#ba1a1a] focus:border-[#ba1a1a]' : ''}`}
          />
          {form.availableMeters && form.totalMeters && Number(form.availableMeters) > Number(form.totalMeters) && (
            <p className="text-[11px] text-[#ba1a1a] mt-1">Cannot exceed total ({form.totalMeters} m)</p>
          )}
        </div>
      </div>

    </div>
  )
}
