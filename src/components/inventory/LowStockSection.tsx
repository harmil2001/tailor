import Link from 'next/link'
import { AlertTriangle, ChevronRight, PackageCheck } from 'lucide-react'
import type { LowStockAlert, Fabric } from '@/db/schema'

type AlertWithFabric = LowStockAlert & { fabric: Fabric }

const MAX_VISIBLE = 5

export default function LowStockSection({ alerts }: { alerts: AlertWithFabric[] }) {
  const visible = alerts.slice(0, MAX_VISIBLE)
  const remaining = alerts.length - MAX_VISIBLE

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
            Low Stock
          </h2>
          <span className="text-[11px] font-bold text-white bg-danger px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </div>
        <Link
          href="/inventory?filter=low"
          className="text-[12px] font-semibold text-accent active:opacity-70 transition-opacity"
        >
          View all →
        </Link>
      </div>

      <div className="bg-white rounded-[20px] border border-line/20 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] overflow-hidden">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <div className="w-11 h-11 rounded-2xl bg-success-tint flex items-center justify-center">
              <PackageCheck size={22} className="text-success" />
            </div>
            <p className="text-[13px] font-semibold text-ink">All fabrics well stocked</p>
            <p className="text-[11px] text-ink-muted">No low stock alerts at the moment</p>
          </div>
        )}
        {visible.map((alert, i) => {
          const avail = parseFloat(alert.availableMeters)
          const total = parseFloat(alert.totalMeters)
          const pct   = total > 0 ? Math.min((avail / total) * 100, 100) : 0
          const isLast = i === visible.length - 1 && remaining <= 0

          return (
            <Link href={`/inventory/${alert.fabric.id}`} key={alert.id}>
              <div className={`px-4 py-3.5 flex items-center gap-3 active:bg-canvas transition-colors ${isLast ? '' : 'border-b border-line/20'}`}>
                <div className="w-9 h-9 rounded-xl bg-danger-tint flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {alert.fabric.brand}
                    </p>
                    <span className="text-[13px] font-bold text-danger shrink-0">
                      {avail.toFixed(1)}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-danger rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-ink-muted shrink-0">{Math.round(pct)}%</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1">
                    {alert.fabric.color} · {alert.fabric.dealerName}
                  </p>
                </div>
                <ChevronRight size={14} className="text-line flex-shrink-0" />
              </div>
            </Link>
          )
        })}

        {remaining > 0 && (
          <Link href="/inventory?filter=low">
            <div className="px-4 py-3 border-t border-line/20 flex items-center justify-center active:bg-canvas transition-colors">
              <span className="text-[13px] font-semibold text-accent">
                Show {remaining} more →
              </span>
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}
