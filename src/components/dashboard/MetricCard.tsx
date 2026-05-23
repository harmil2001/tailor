import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: number
  accent?: boolean
  icon?: ReactNode
}

export default function MetricCard({ label, value, accent = false, icon }: MetricCardProps) {
  return (
    <div className="flex-1 bg-white p-5 rounded-[24px] shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-[#c6c6cd]/30 flex flex-col justify-between h-32">
      <span className="text-[12px] font-semibold tracking-widest text-[#45464d] uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-[28px] font-bold leading-none ${accent ? 'text-[#775a19]' : 'text-[#0b1c30]'}`}
          style={{ fontFamily: 'Manrope' }}
        >
          {value}
        </span>
        {icon}
      </div>
    </div>
  )
}
