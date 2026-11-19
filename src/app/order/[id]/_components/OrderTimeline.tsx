import { Check, X } from 'lucide-react'
import type { OrderStatus } from '@/db/schema'

const STEPS: { key: OrderStatus | 'Placed'; label: string; sub: string }[] = [
  { key: 'Placed',    label: 'Order Placed',      sub: 'Measurements confirmed' },
  { key: 'Stitching', label: 'Stitching',          sub: 'Work in progress'       },
  { key: 'Ready',     label: 'Ready for Pickup',   sub: 'Come collect your order' },
  { key: 'Delivered', label: 'Delivered',          sub: 'Order complete'          },
]

const STATUS_INDEX: Record<OrderStatus, number> = {
  Pending:   0,
  Stitching: 1,
  Ready:     2,
  Delivered: 3,
  Cancelled: -1,
}

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'Cancelled') {
    return (
      <div className="bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-5">
        <p className="text-[12px] font-semibold tracking-widest text-ink-soft uppercase mb-4">Order Progress</p>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-neutral-tint flex items-center justify-center flex-shrink-0">
            <X size={14} strokeWidth={2.5} className="text-ink-soft" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink-soft">Order Cancelled</p>
            <p className="text-[12px] text-ink-muted mt-0.5">This order has been cancelled</p>
          </div>
        </div>
      </div>
    )
  }

  const activeIndex = STATUS_INDEX[status]
  const allDone     = status === 'Delivered'

  return (
    <div className="bg-white rounded-[24px] border border-line/40 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] px-5 py-5">
      <p className="text-[12px] font-semibold tracking-widest text-ink-soft uppercase mb-5">
        Order Progress
      </p>

      <div className="flex flex-col">
        {STEPS.map((step, i) => {
          const isDone    = allDone || i < activeIndex
          const isActive  = !allDone && i === activeIndex
          const isPending = !allDone && i > activeIndex

          return (
            <div key={step.key} className="flex gap-4">
              {/* Spine */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isDone   ? 'bg-brand'           :
                  isActive ? 'bg-accent'       :
                             'bg-canvas border-2 border-line'
                }`}>
                  {isDone   && <Check size={14} strokeWidth={2.5} className="text-white" />}
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 min-h-[28px] ${isDone ? 'bg-brand' : 'bg-line/60'}`} />
                )}
              </div>

              {/* Label */}
              <div className={`pb-5 pt-1 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <p className={`text-[14px] font-semibold leading-tight ${
                  isPending ? 'text-line' : 'text-ink'
                }`}>
                  {step.label}
                </p>
                <p className={`text-[12px] mt-0.5 ${
                  isPending ? 'text-line' : 'text-ink-muted'
                }`}>
                  {step.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
