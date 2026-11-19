'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import DealerCard from './DealerCard'
import { fetchDealersPage } from '@/app/(app)/dealers/actions'
import { DEALERS_PAGE_SIZE } from '@/app/(app)/dealers/constants'
import type { DealerWithBalance } from '@/app/(app)/dealers/actions'

interface Props {
  initialDealers: DealerWithBalance[]
  total: number
  query?: string
}

export default function DealerList({ initialDealers, total, query }: Props) {
  const [list, setList]       = useState(initialDealers)
  const [offset, setOffset]   = useState(initialDealers.length)
  const [hasMore, setHasMore] = useState(initialDealers.length < total)
  const [loading, setLoading] = useState(false)
  const sentinelRef           = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const more = await fetchDealersPage(offset, query)
    setList(prev => [...prev, ...more])
    setOffset(prev => prev + more.length)
    if (more.length < DEALERS_PAGE_SIZE) setHasMore(false)
    setLoading(false)
  }, [loading, hasMore, offset, query])

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
      {list.map(dealer => (
        <DealerCard key={dealer.id} dealer={dealer} />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {loading && (
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {!hasMore && list.length > DEALERS_PAGE_SIZE && (
        <p className="text-center text-[12px] text-ink-muted py-2">All dealers loaded</p>
      )}
    </div>
  )
}
