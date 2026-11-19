'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TABS = [
  { value: 'week',  label: 'Last Week'   },
  { value: 'month', label: 'Last Month'  },
  { value: '3m',    label: 'Last 3 Months' },
  { value: '6m',    label: 'Last 6 Months' },
  { value: 'year',  label: 'Last Year'   },
] as const

export default function PeriodTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('period') ?? ''

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (active === value) params.delete('period')
    else params.set('period', value)
    router.replace(`/orders?${params}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
      {TABS.map(({ value, label }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            onClick={() => select(value)}
            className={`flex-none px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95 ${
              isActive
                ? 'bg-brand text-white shadow-md'
                : 'bg-white text-ink-soft border border-line'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
