'use client'

import { useRef, useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download } from 'lucide-react'

export default function FabricQRCode({
  fabricId,
  label,
  code,
}: {
  fabricId: string
  label: string
  code: string
}) {
  const canvasRef           = useRef<HTMLCanvasElement>(null)
  const [origin, setOrigin] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  function handleDownload() {
    const qrCanvas = canvasRef.current
    if (!qrCanvas) return

    const pad       = 32
    const codeSize  = 30
    const labelSize = 15
    const gap       = 16
    const w = qrCanvas.width + pad * 2
    const h = qrCanvas.height + pad + gap + codeSize + gap + labelSize + pad

    const out = document.createElement('canvas')
    out.width  = w
    out.height = h
    const ctx  = out.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    ctx.drawImage(qrCanvas, pad, pad, qrCanvas.width, qrCanvas.height)

    const textY = qrCanvas.height + pad + gap + codeSize
    ctx.textAlign = 'center'
    ctx.fillStyle = '#0b1c30'
    ctx.font      = `bold ${codeSize}px monospace`
    ctx.fillText(code, w / 2, textY)

    ctx.fillStyle = '#76777d'
    ctx.font      = `${labelSize}px sans-serif`
    ctx.fillText(label, w / 2, textY + gap + labelSize)

    const a      = document.createElement('a')
    a.href       = out.toDataURL('image/png')
    a.download   = `fabric-${code.toLowerCase()}.png`
    a.click()
  }

  if (!origin) return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[212px] h-[212px] bg-surface-muted rounded-[20px] animate-pulse" />
    </div>
  )

  const url = `${origin}/inventory/${fabricId}`

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-[20px] border border-line/40 shadow-sm">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={180}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-[11px] text-ink-muted text-center max-w-[220px]">
        Scan to open this fabric&apos;s page instantly.
      </p>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 h-11 px-5 bg-brand text-white rounded-xl text-[13px] font-semibold active:scale-95 transition-transform"
      >
        <Download size={15} /> Download QR + Code
      </button>
    </div>
  )
}
