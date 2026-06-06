'use client'

import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download } from 'lucide-react'

export default function FabricQRCode({
  fabricId,
  label,
}: {
  fabricId: string
  label: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url       = `${typeof window !== 'undefined' ? window.location.origin : ''}/inventory/${fabricId}`

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const a       = document.createElement('a')
    a.href        = dataUrl
    a.download    = `fabric-qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-[20px] border border-[#c6c6cd]/40 shadow-sm">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={180}
          level="M"
          includeMargin={false}
          imageSettings={{
            src: '',
            height: 0,
            width: 0,
            excavate: false,
          }}
        />
      </div>
      <p className="text-[11px] text-[#76777d] text-center max-w-[220px]">
        Scan this QR code on the fabric bolt to quickly access and update this entry.
      </p>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 h-11 px-5 bg-black text-white rounded-xl text-[13px] font-semibold active:scale-95 transition-transform"
      >
        <Download size={15} /> Download QR Code
      </button>
    </div>
  )
}
