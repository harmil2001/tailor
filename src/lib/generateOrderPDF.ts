import jsPDF from 'jspdf'
import { BRAND, BRAND_FULL } from '@/lib/brand'
import { THEME } from '@/config'

type Item = { name: string; clothProvidedBy: 'Customer' | 'Tailor' }

export interface OrderPDFData {
  id: string
  customerName: string
  customerPhone: string
  items: Item[]
  orderDate: string
  status: string
  totalAmount: string
  advancePaid: string
  notes?: string | null
}

// jsPDF needs literal colours, so they come from the shop's resolved theme.
const C = {
  black:   THEME.brand,
  gold:    THEME['accent-soft'],
  white:   '#ffffff',
  gray:    THEME['ink-soft'],
  light:   THEME['surface-muted'],
  border:  THEME.line,
  red:     THEME.danger,
  green:   THEME.success,
  onDark:  THEME['brand-tint-strong'], // small text on the dark header and footer
}

function rgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}

const tc  = (doc: jsPDF, hex: string) => doc.setTextColor(...rgb(hex))
const fc  = (doc: jsPDF, hex: string) => doc.setFillColor(...rgb(hex))
const dc  = (doc: jsPDF, hex: string) => doc.setDrawColor(...rgb(hex))

function line(doc: jsPDF, y: number, x1: number, x2: number, hex = C.border, lw = 0.3) {
  dc(doc, hex); doc.setLineWidth(lw); doc.line(x1, y, x2, y)
}

function tag(doc: jsPDF, label: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); tc(doc, C.gray)
  doc.text(label, x, y)
}

function statusColors(s: string): [string, string] {
  const map: Record<string, [string, string]> = {
    Pending:   [THEME['danger-tint'],  THEME['danger-ink']],
    Stitching: [THEME['accent-tint'],  THEME['accent-ink']],
    Ready:     [THEME['info-tint'],    THEME['info-ink']],
    Delivered: [THEME['success-tint'], THEME.success],
    Cancelled: [THEME['neutral-tint'], THEME['ink-soft']],
  }
  return map[s] ?? [THEME['neutral-tint'], THEME['ink-soft']]
}

export function generateOrderPDF(order: OrderPDFData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
  const W   = doc.internal.pageSize.getWidth()  // 148mm
  const H   = doc.internal.pageSize.getHeight() // 210mm
  const pad = 13
  const col = W - pad * 2

  let y = 0

  // ── Header ─────────────────────────────────────────────────────────
  fc(doc, C.black); doc.rect(0, 0, W, 30, 'F')
  fc(doc, C.gold);  doc.rect(0, 0, W, 1.5, 'F')   // top gold line

  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); tc(doc, C.gold)
  doc.text(BRAND.name.toUpperCase(), W / 2, 14, { align: 'center' })

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); tc(doc, C.onDark)
  doc.text(BRAND.tagline, W / 2, 21.5, { align: 'center' })

  fc(doc, C.gold); doc.rect(0, 29, W, 1, 'F')      // bottom gold line

  y = 38

  // ── Order ID + Status (single compact row) ─────────────────────────
  // Order ID — small, unobtrusive
  tag(doc, 'ORDER ID', pad, y)
  doc.setFont('courier', 'normal'); doc.setFontSize(7.5); tc(doc, C.gray)
  doc.text(order.id, pad, y + 5)

  // Status pill — right side
  const [bgHex, fgHex] = statusColors(order.status)
  const slabel = order.status.toUpperCase()
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  const pillW = doc.getTextWidth(slabel) + 7
  const pillX = W - pad - pillW
  fc(doc, bgHex); doc.roundedRect(pillX, y - 1, pillW, 7, 1.5, 1.5, 'F')
  tc(doc, fgHex); doc.text(slabel, pillX + 3.5, y + 4.2)

  y += 13
  line(doc, y, pad, W - pad)
  y += 7

  // ── Customer + Date ────────────────────────────────────────────────
  tag(doc, 'CUSTOMER', pad, y)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); tc(doc, C.gray)
  doc.text('ORDER DATE', W - pad, y, { align: 'right' })

  y += 5
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); tc(doc, C.black)
  doc.text(order.customerName, pad, y)

  const dateStr = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); tc(doc, C.black)
  doc.text(dateStr, W - pad, y, { align: 'right' })

  y += 5.5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); tc(doc, C.gray)
  doc.text(order.customerPhone, pad, y)

  y += 9
  line(doc, y, pad, W - pad)
  y += 7

  // ── Items ──────────────────────────────────────────────────────────
  tag(doc, 'ITEMS', pad, y)
  y += 5.5

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i]

    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); tc(doc, C.gray)
    doc.text(`${i + 1}.`, pad + 2, y + 3)

    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); tc(doc, C.black)
    doc.text(item.name, pad + 7, y + 3)

    const cloth = item.clothProvidedBy === 'Customer' ? "Customer's cloth" : "Shop's cloth"
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); tc(doc, C.gray)
    doc.text(cloth, W - pad - 2, y + 3, { align: 'right' })

    y += 11
  }

  y += 3
  line(doc, y, pad, W - pad)
  y += 7

  // ── Payment Summary ────────────────────────────────────────────────
  tag(doc, 'PAYMENT SUMMARY', pad, y)
  y += 7

  const total   = parseFloat(order.totalAmount)
  const advance = parseFloat(order.advancePaid)
  const balance = total - advance
  const isPaid  = balance === 0

  function payRow(label: string, value: string, bold = false) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(9); tc(doc, bold ? C.black : C.gray)
    doc.text(label, pad + 2, y)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); tc(doc, C.black)
    doc.text(value, W - pad - 2, y, { align: 'right' })
    y += 8
  }

  payRow('Total Amount',  `Rs. ${total.toLocaleString('en-IN')}`)
  payRow('Advance Paid',  `Rs. ${advance.toLocaleString('en-IN')}`)

  // Dashed separator before balance
  dc(doc, C.border); doc.setLineWidth(0.3)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(pad, y - 3, W - pad, y - 3)
  doc.setLineDashPattern([], 0)

  // Balance row
  const balColor = isPaid ? C.green : C.red
  const balValue = isPaid ? 'Paid' : `Rs. ${balance.toLocaleString('en-IN')}`
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); tc(doc, balColor)
  doc.text('Balance Due', pad + 2, y + 2)
  doc.setFontSize(10)
  doc.text(isPaid ? 'PAID  ✓' : balValue, W - pad - 2, y + 2, { align: 'right' })
  y += 12

  // ── Notes ──────────────────────────────────────────────────────────
  if (order.notes) {
    line(doc, y, pad, W - pad)
    y += 7

    tag(doc, 'NOTES', pad, y)
    y += 5.5

    const noteLines = doc.splitTextToSize(order.notes, col - 6) as string[]
    const noteH     = noteLines.length * 4.5 + 8

    // Cap notes height to avoid overflow
    const safeLines = doc.splitTextToSize(
      order.notes,
      col - 6,
    ) as string[]
    const maxLines  = Math.min(safeLines.length, 4)
    const capped    = safeLines.slice(0, maxLines)
    const cappedH   = capped.length * 4.5 + 8

    fc(doc, C.light)
    doc.roundedRect(pad, y, col, cappedH, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); tc(doc, C.black)
    doc.text(capped, pad + 4, y + 6)
    if (maxLines < noteLines.length) {
      tc(doc, C.gray); doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
      doc.text('…', pad + 4, y + cappedH - 1)
    }
    y += cappedH + 6
  }

  // ── Footer ─────────────────────────────────────────────────────────
  const footY = H - 14
  fc(doc, C.gold); doc.rect(0, footY, W, 0.8, 'F')
  fc(doc, C.black); doc.rect(0, footY + 0.8, W, 13.2, 'F')

  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); tc(doc, C.gold)
  doc.text(BRAND_FULL, W / 2, footY + 6.5, { align: 'center' })

  doc.setFont('courier', 'normal'); doc.setFontSize(6); tc(doc, C.onDark)
  doc.text(`Order ID: ${order.id}`, W / 2, footY + 11.5, { align: 'center' })

  const safeName = order.customerName.replace(/\s+/g, '-')
  doc.save(`${BRAND.name}-${safeName}-${order.id.slice(0, 8)}.pdf`)
}
