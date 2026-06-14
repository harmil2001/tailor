'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function DealerSearchBar({ defaultValue }: { defaultValue: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted    = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) params.set('q', value.trim())
      else params.delete('q')
      router.replace(`${pathname}?${params}`, { scroll: false })
    }, 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#76777d]" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search dealer by name…"
        className="w-full h-12 pl-11 pr-10 bg-white border border-[#c6c6cd] rounded-xl text-[14px] text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none focus:border-black transition-colors shadow-sm"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[#c6c6cd]/40 active:scale-90 transition-transform"
        >
          <X size={12} className="text-[#45464d]" />
        </button>
      )}
    </div>
  )
}
