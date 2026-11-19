'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  param:        string
  options:      Option[]
  defaultLabel: string
  activeColor?: 'black' | 'gold'
  icon?:        ReactNode
}

export default function FilterSelect({ param, options, defaultLabel, activeColor = 'black', icon }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = searchParams.get(param) ?? ''
  const activeOption = options.find(o => o.value === current)
  const isActive     = !!current

  const [open, setOpen]       = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, minWidth: 0 })
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const dropdownRef           = useRef<HTMLDivElement>(null)

  const openDropdown = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const minWidth = Math.max(rect.width, 180)
      const left     = Math.min(rect.left, window.innerWidth - minWidth - 16)
      setDropPos({ top: rect.bottom + 6, left: Math.max(16, left), minWidth })
    }
    setOpen(v => !v)
  }

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value) params.delete(param)
    else params.set(param, value)
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

  const activeCls = activeColor === 'gold'
    ? 'bg-accent text-white border-transparent'
    : 'bg-brand text-white border-transparent'

  const label = isActive ? activeOption?.label : defaultLabel

  return (
    <div className="relative flex-none">
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all active:scale-95 ${
          isActive ? activeCls : 'bg-white text-ink-soft border-line'
        }`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{label}</span>
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          className={`transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, minWidth: dropPos.minWidth }}
          className="z-[200] bg-white rounded-2xl shadow-[0px_8px_32px_rgba(15,23,42,0.14)] border border-line/40 py-1.5 overflow-hidden"
        >
          <button
            onClick={() => select('')}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-canvas active:bg-brand-tint"
          >
            <span className={!current ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}>
              {defaultLabel}
            </span>
            {!current && <Check size={14} className="text-accent" />}
          </button>

          <div className="h-px bg-line/30 mx-3 my-1" />

          {options.map(o => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-canvas active:bg-brand-tint"
            >
              <span className={current === o.value ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}>
                {o.label}
              </span>
              {current === o.value && <Check size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
