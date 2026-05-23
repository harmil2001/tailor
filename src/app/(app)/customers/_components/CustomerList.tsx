'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import CustomerCard from '@/components/customers/CustomerCard'
import { fetchCustomersPage } from '../actions'
import { CUSTOMERS_PAGE_SIZE } from '../constants'
import type { Customer } from '@/db/schema'

interface Props {
  initialCustomers: Customer[]
  total:  number
  query?: string
}

export default function CustomerList({ initialCustomers, total, query }: Props) {
  const [list, setList]       = useState(initialCustomers)
  const [offset, setOffset]   = useState(initialCustomers.length)
  const [hasMore, setHasMore] = useState(initialCustomers.length < total)
  const [loading, setLoading] = useState(false)
  const sentinelRef           = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const more = await fetchCustomersPage(offset, query)
    setList(prev => [...prev, ...more])
    setOffset(prev => prev + more.length)
    if (more.length < CUSTOMERS_PAGE_SIZE) setHasMore(false)
    setLoading(false)
  }, [loading, hasMore, offset])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <div className="flex flex-col gap-3">
      {list.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {loading && (
            <div className="w-6 h-6 border-2 border-[#775a19] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {!hasMore && list.length > CUSTOMERS_PAGE_SIZE && (
        <p className="text-center text-[12px] text-[#76777d] py-2">All customers loaded</p>
      )}
    </div>
  )
}
