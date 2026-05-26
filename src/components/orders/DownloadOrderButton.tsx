'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { OrderPDFData } from '@/lib/generateOrderPDF'

export default function DownloadOrderButton({ order }: { order: OrderPDFData }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    const { generateOrderPDF } = await import('@/lib/generateOrderPDF')
    generateOrderPDF(order)
    setLoading(false)
  }

  return (
    <button
      onClick={e => { e.preventDefault(); handleDownload() }}
      disabled={loading}
      aria-label="Download order PDF"
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#c6c6cd]/60 shadow-sm active:scale-95 transition-transform disabled:opacity-50"
    >
      <Download size={15} className="text-[#45464d]" />
    </button>
  )
}
