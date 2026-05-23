'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import OrderCard from '@/components/orders/OrderCard'
import { fetchOrdersPage } from '../actions'
import { PAGE_SIZE } from '../constants'
import type { OrderFilters } from '../constants'
import type { Order, Customer } from '@/db/schema'

type OrderWithCustomer = Order & { customer: Customer }

interface Props {
  initialOrders: OrderWithCustomer[]
  filters: OrderFilters
}

export default function OrderList({ initialOrders, filters }: Props) {
  const [list, setList]       = useState(initialOrders)
  const [offset, setOffset]   = useState(initialOrders.length)
  const [hasMore, setHasMore] = useState(initialOrders.length >= PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const sentinelRef           = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setList(initialOrders)
    setOffset(initialOrders.length)
    setHasMore(initialOrders.length >= PAGE_SIZE)
  }, [initialOrders])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const more = await fetchOrdersPage(filters, offset)
    setList(prev => [...prev, ...more])
    setOffset(prev => prev + more.length)
    if (more.length < PAGE_SIZE) setHasMore(false)
    setLoading(false)
  }, [loading, hasMore, filters, offset])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <div className="flex flex-col gap-3">
      {list.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {loading && (
            <div className="w-6 h-6 border-2 border-[#775a19] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {!hasMore && list.length > PAGE_SIZE && (
        <p className="text-center text-[12px] text-[#76777d] py-2">All orders loaded</p>
      )}
    </div>
  )
}
