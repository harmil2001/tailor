'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TABS = ['All', 'Pending', 'Stitching', 'Ready', 'Delivered', 'Cancelled'] as const

export default function StatusTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('status') ?? 'All'

  const select = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'All') params.delete('status')
    else params.set('status', tab)
    router.replace(`/orders?${params}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
      {TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            onClick={() => select(tab)}
            className={`flex-none px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95 ${
              isActive
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-[#45464d] border border-[#c6c6cd]'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
