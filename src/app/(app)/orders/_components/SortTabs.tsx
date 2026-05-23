'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react'

const TABS = [
  { value: 'high', label: 'Highest Value', icon: ArrowDownWideNarrow },
  { value: 'low',  label: 'Lowest Value',  icon: ArrowUpWideNarrow  },
] as const

export default function SortTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('sort') ?? ''

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (active === value) params.delete('sort')
    else params.set('sort', value)
    router.replace(`/orders?${params}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
      {TABS.map(({ value, label, icon: Icon }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            onClick={() => select(value)}
            className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95 ${
              isActive
                ? 'bg-[#775a19] text-white shadow-md'
                : 'bg-white text-[#45464d] border border-[#c6c6cd]'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
