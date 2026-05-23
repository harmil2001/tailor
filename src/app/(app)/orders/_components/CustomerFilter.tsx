'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, Check, Search, User } from 'lucide-react'

interface CustomerOption {
  id:    string
  name:  string
  phone: string
}

export default function CustomerFilter({ customers }: { customers: CustomerOption[] }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = searchParams.get('customer') ?? ''

  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, minWidth: 0 })
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const dropdownRef           = useRef<HTMLDivElement>(null)

  const active = customers.find(c => c.id === current)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q),
    )
  }, [customers, query])

  function openDropdown() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const minWidth = Math.max(rect.width, 230)
      const left     = Math.min(rect.left, window.innerWidth - minWidth - 16)
      setDropPos({ top: rect.bottom + 6, left: Math.max(16, left), minWidth })
    }
    setQuery('')
    setOpen(v => !v)
  }

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!id) params.delete('customer')
    else params.set('customer', id)
    router.replace(`${pathname}?${params}`, { scroll: false })
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      const t = e.target as Node
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const label = active ? active.name.split(' ')[0] : 'Customer'

  return (
    <div className="relative flex-none">
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all active:scale-95 ${
          current ? 'bg-black text-white border-transparent' : 'bg-white text-[#45464d] border-[#c6c6cd]'
        }`}
      >
        <User size={12} strokeWidth={2.5} className="flex-shrink-0" />
        <span>{label}</span>
        <ChevronDown size={11} strokeWidth={2.5} className={`transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, minWidth: dropPos.minWidth }}
          className="z-[200] bg-white rounded-2xl shadow-[0px_8px_32px_rgba(15,23,42,0.14)] border border-[#c6c6cd]/40 overflow-hidden"
        >
          {/* Search input */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 h-9 px-3 bg-[#f8f9ff] rounded-xl border border-[#c6c6cd]/40">
              <Search size={13} className="text-[#76777d] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or phone…"
                className="flex-1 min-w-0 text-[12px] text-[#0b1c30] bg-transparent focus:outline-none placeholder:text-[#76777d]"
              />
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {/* All option — always visible */}
            <button
              onClick={() => select('')}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-[#f8f9ff] active:bg-[#e5eeff] transition-colors"
            >
              <span className={!current ? 'font-semibold text-[#0b1c30]' : 'font-medium text-[#45464d]'}>
                All Customers
              </span>
              {!current && <Check size={14} className="text-[#775a19]" />}
            </button>

            {/* Results only when searching */}
            {query.trim() && (
              <>
                <div className="h-px bg-[#c6c6cd]/30 mx-3" />
                {filtered.length === 0 ? (
                  <p className="text-[12px] text-[#76777d] text-center py-5">No customers found</p>
                ) : (
                  filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => select(c.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#f8f9ff] active:bg-[#e5eeff] transition-colors"
                    >
                      <div className="text-left min-w-0">
                        <p className={`text-[13px] truncate ${current === c.id ? 'font-semibold text-[#0b1c30]' : 'font-medium text-[#45464d]'}`}>
                          {c.name}
                        </p>
                        <p className="text-[11px] text-[#76777d]">{c.phone}</p>
                      </div>
                      {current === c.id && <Check size={14} className="text-[#775a19] flex-shrink-0 ml-2" />}
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
