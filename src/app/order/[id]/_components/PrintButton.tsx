'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full h-12 flex items-center justify-center gap-2 border border-black rounded-xl text-[14px] font-semibold text-black bg-white active:scale-95 transition-transform"
    >
      <Printer size={17} />
      Print / Save as PDF
    </button>
  )
}
