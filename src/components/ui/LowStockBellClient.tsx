'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, X, ChevronRight, CheckCheck, Loader2 } from 'lucide-react'
import type { LowStockAlert, Fabric } from '@/db/schema'
import { acknowledgeAlert } from '@/app/(app)/inventory/alertActions'

type AlertWithFabric = LowStockAlert & { fabric: Fabric }
type Tab = 'open' | 'acknowledged'

function AlertRow({ alert, onAck }: { alert: AlertWithFabric; onAck: (id: string) => void }) {
  const [isPending, start] = useTransition()
  const isActive = !alert.acknowledgedAt
  const avail    = parseFloat(alert.availableMeters)
  const total    = parseFloat(alert.totalMeters)
  const pct      = total > 0 ? Math.round((avail / total) * 100) : 0
  const ackDate  = alert.acknowledgedAt
    ? new Date(alert.acknowledgedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="px-4 py-3 border-b border-[#c6c6cd]/20 last:border-0">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isActive ? 'bg-[#ffdad6]' : 'bg-[#e5eeff]'}`}>
          <span className="text-[15px]">🧵</span>
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/inventory/${alert.fabric.id}`} className="block">
            <p className="text-[13px] font-semibold text-[#0b1c30] truncate">
              {alert.fabric.brand} · {alert.fabric.color}
            </p>
            <p className="text-[11px] text-[#76777d] mt-0.5">
              {alert.fabric.dealerName} · {alert.fabric.pattern}
            </p>
          </Link>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isActive ? 'bg-[#ba1a1a]' : 'bg-[#45464d]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-[11px] font-bold flex-shrink-0 ${isActive ? 'text-[#ba1a1a]' : 'text-[#45464d]'}`}>
              {avail.toFixed(1)}m ({pct}%)
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            {isActive ? (
              <>
                <span className="text-[10px] font-semibold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                  Active · {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                <button
                  onClick={() => { start(async () => { await onAck(alert.id) }) }}
                  disabled={isPending}
                  className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#0b1c30] text-white text-[11px] font-semibold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={10} className="animate-spin" /> : <CheckCheck size={11} />}
                  Acknowledge
                </button>
              </>
            ) : (
              <span className="text-[10px] font-semibold text-[#1a5c34] bg-[#d6f5e3] px-2 py-0.5 rounded-full">
                Acknowledged · {ackDate}
              </span>
            )}
          </div>
        </div>
        <Link href={`/inventory/${alert.fabric.id}`}>
          <ChevronRight size={14} className="text-[#c6c6cd] mt-1 flex-shrink-0" />
        </Link>
      </div>
    </div>
  )
}

export default function LowStockBellClient({
  alerts,
  activeCount,
}: {
  alerts: AlertWithFabric[]
  activeCount: number
}) {
  const router  = useRouter()
  const [open, setOpen]   = useState(false)
  const [tab, setTab]     = useState<Tab>('open')
  const [list, setList]   = useState(alerts)

  async function handleAck(id: string) {
    await acknowledgeAlert(id)
    setList(prev => prev.map(a => a.id === id ? { ...a, acknowledgedAt: new Date() } : a))
    router.refresh()
  }

  const openAlerts = list.filter(a => !a.acknowledgedAt)
  const ackedAlerts = list.filter(a =>  a.acknowledgedAt)
  const badge = openAlerts.length
  const visible = tab === 'open' ? openAlerts : ackedAlerts

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`${badge} low stock alert${badge !== 1 ? 's' : ''}`}
        className="relative w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform"
      >
        <Bell size={20} strokeWidth={2} className="text-[#0b1c30]" />
        {badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div className="fixed top-[62px] left-3 right-3 z-[101] bg-white rounded-[20px] shadow-[0px_8px_40px_rgba(15,23,42,0.18)] border border-[#c6c6cd]/40 overflow-hidden max-w-sm mx-auto">

            <div className="px-4 pt-3.5 pb-3 border-b border-[#c6c6cd]/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Stock Alerts
                </p>
                <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f8f9ff] border border-[#c6c6cd]/40 active:scale-90 transition-transform">
                  <X size={14} className="text-[#45464d]" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTab('open')}
                  className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                    tab === 'open'
                      ? 'bg-[#ba1a1a] text-white'
                      : 'bg-[#f4f4f4] text-[#45464d]'
                  }`}
                >
                  Open
                  {openAlerts.length > 0 && (
                    <span className={`text-[10px] font-bold px-1 rounded-full ${tab === 'open' ? 'bg-white/30 text-white' : 'bg-[#e0e0e0] text-[#45464d]'}`}>
                      {openAlerts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTab('acknowledged')}
                  className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                    tab === 'acknowledged'
                      ? 'bg-[#0b1c30] text-white'
                      : 'bg-[#f4f4f4] text-[#45464d]'
                  }`}
                >
                  Acknowledged
                  {ackedAlerts.length > 0 && (
                    <span className={`text-[10px] font-bold px-1 rounded-full ${tab === 'acknowledged' ? 'bg-white/30 text-white' : 'bg-[#e0e0e0] text-[#45464d]'}`}>
                      {ackedAlerts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'min(65vh, 420px)' }}>
              {visible.length === 0 ? (
                <p className="text-center text-[12px] text-[#76777d] py-8">
                  {tab === 'open' ? 'No open alerts' : 'No acknowledged alerts'}
                </p>
              ) : (
                visible.map(a => (
                  <AlertRow key={a.id} alert={a} onAck={handleAck} />
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#c6c6cd]/20">
              <Link
                href="/inventory?filter=low"
                onClick={() => setOpen(false)}
                className="block text-center text-[12px] font-semibold text-[#775a19] active:opacity-70 transition-opacity"
              >
                View all low-stock items →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
