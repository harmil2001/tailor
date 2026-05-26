'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Download, Trash2, Loader2 } from 'lucide-react'
import { deleteOrder } from '@/app/(app)/orders/actions'
import EditOrderSheet from './EditOrderSheet'
import type { Order, Customer } from '@/db/schema'
import type { OrderPDFData } from '@/lib/generateOrderPDF'

type Props = { order: Order & { customer: Customer } }

export default function OrderActionsMenu({ order }: Props) {
  const router = useRouter()
  const [mounted, setMounted]       = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteConfirm, setConfirm] = useState(false)
  const [isPending, start]          = useTransition()

  useEffect(() => { setMounted(true) }, [])

  function openMenu(e: React.MouseEvent) {
    e.preventDefault()
    setMenuOpen(true)
  }

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault()
    setMenuOpen(false)
    const { generateOrderPDF } = await import('@/lib/generateOrderPDF')
    const pdfData: OrderPDFData = {
      id:           order.id,
      customerName: order.customer.name,
      customerPhone:order.customer.phone,
      items:        order.items,
      orderDate:    order.orderDate,
      status:       order.status,
      totalAmount:  order.totalAmount,
      advancePaid:  order.advancePaid,
      notes:        order.notes,
    }
    generateOrderPDF(pdfData)
  }

  function handleEdit(e: React.MouseEvent) {
    e.preventDefault()
    setMenuOpen(false)
    setEditOpen(true)
  }

  function handleDeleteTap(e: React.MouseEvent) {
    e.preventDefault()
    setMenuOpen(false)
    setConfirm(true)
  }

  function handleDelete() {
    start(async () => {
      const result = await deleteOrder(order.id)
      if (result.success) { setConfirm(false); router.refresh() }
    })
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openMenu}
        aria-label="Order actions"
        className="p-1 active:opacity-50 transition-opacity"
      >
        <MoreVertical size={18} className="text-[#45464d]" />
      </button>

      {/* Edit sheet — rendered always, opened via triggerOpen */}
      <EditOrderSheet order={order} triggerOpen={editOpen} onClose={() => setEditOpen(false)} />

      {mounted && createPortal(
        <>
          {/* ── Action sheet ───────────────────────────────────────── */}
          {menuOpen && (
            <div className="fixed inset-0 z-[9998] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
              <div className="relative bg-white rounded-t-[28px] px-4 pt-4 pb-8 flex flex-col gap-1 shadow-xl">
                <div className="w-10 h-1 rounded-full bg-[#c6c6cd] mx-auto mb-3" />

                <button
                  onClick={handleEdit}
                  className="flex items-center gap-4 w-full px-4 h-14 rounded-2xl active:bg-[#f8f9ff] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#f0f0f5] flex items-center justify-center flex-shrink-0">
                    <Pencil size={15} className="text-[#0b1c30]" />
                  </div>
                  <span className="text-[15px] font-medium text-[#0b1c30]">Edit Order</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-4 w-full px-4 h-14 rounded-2xl active:bg-[#f8f9ff] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#f0f0f5] flex items-center justify-center flex-shrink-0">
                    <Download size={15} className="text-[#0b1c30]" />
                  </div>
                  <span className="text-[15px] font-medium text-[#0b1c30]">Download PDF</span>
                </button>

                <div className="h-px bg-[#f0f0f5] mx-4 my-1" />

                <button
                  onClick={handleDeleteTap}
                  className="flex items-center gap-4 w-full px-4 h-14 rounded-2xl active:bg-[#fff0f0] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#ffdad6] flex items-center justify-center flex-shrink-0">
                    <Trash2 size={15} className="text-[#ba1a1a]" />
                  </div>
                  <span className="text-[15px] font-medium text-[#ba1a1a]">Delete Order</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Delete confirmation ─────────────────────────────────── */}
          {deleteConfirm && (
            <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-6">
              <div className="w-full max-w-sm bg-white rounded-[24px] p-6 flex flex-col gap-4 shadow-xl">
                <div>
                  <p className="text-[17px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Delete this order?
                  </p>
                  <p className="text-[13px] text-[#45464d] mt-2 leading-relaxed">
                    Order for <span className="font-semibold text-[#0b1c30]">{order.customer.name}</span> will be permanently deleted. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirm(false)}
                    disabled={isPending}
                    className="flex-1 h-12 rounded-xl border border-[#c6c6cd] text-[14px] font-semibold text-[#45464d] active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Keep
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex-1 h-12 rounded-xl bg-[#ba1a1a] text-white text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isPending ? <><Loader2 size={15} className="animate-spin" /> Deleting…</> : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  )
}
