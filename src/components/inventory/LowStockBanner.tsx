import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { LowStockAlert, Fabric } from '@/db/schema'

type AlertWithFabric = LowStockAlert & { fabric: Fabric }

export default function LowStockBanner({ alerts }: { alerts: AlertWithFabric[] }) {
  if (alerts.length === 0) return null

  return (
    <Link href="/inventory?filter=low">
      <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-[20px] p-4 active:scale-[0.98] transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ba1a1a]/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-[#ba1a1a]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#93000a]">
                {alerts.length} {alerts.length === 1 ? 'fabric' : 'fabrics'} running low
              </p>
              <p className="text-[11px] text-[#93000a]/70 mt-0.5">
                {alerts.slice(0, 2).map(a => `${a.fabric.brand} (${a.fabric.color})`).join(', ')}
                {alerts.length > 2 && ` +${alerts.length - 2} more`}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#ba1a1a] flex-shrink-0" />
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {alerts.slice(0, 3).map(a => {
            const avail = parseFloat(a.availableMeters)
            const total = parseFloat(a.totalMeters)
            const pct   = total > 0 ? Math.round((avail / total) * 100) : 0
            return (
              <div key={a.id} className="flex items-center justify-between">
                <span className="text-[12px] text-[#93000a]/80 truncate mr-2">
                  {a.fabric.brand} · {a.fabric.color} · {a.fabric.pattern}
                </span>
                <span className="text-[12px] font-bold text-[#ba1a1a] shrink-0">
                  {avail.toFixed(1)}m ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
