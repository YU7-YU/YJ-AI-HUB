'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Run } from '@/shared/schemas/run-history'
import { RunItem } from './run-item'
import { FilterPanel } from './filter-panel'
import { EmptyState } from './empty-state'

type FilterState = {
  status: 'all' | 'success' | 'error'
  modelId: string
  timeRange: '1h' | '24h' | '7d' | 'custom'
}

type RunListProps = {
  initialRuns: Run[]
  initialCursor: string | null
  initialHasMore: boolean
  initialModels: string[]
  selectedRunId: string | null
  onSelectRun: (runId: string | null) => void
}

export function RunList({
  initialRuns,
  initialCursor,
  initialHasMore,
  initialModels,
  selectedRunId,
  onSelectRun,
}: RunListProps) {
  const [runs, setRuns] = useState<Run[]>(initialRuns)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    modelId: 'all',
    timeRange: '24h',
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchRuns = useCallback(
    async (c: string | null, reset = false) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (c) params.set('cursor', c)
        if (filters.status !== 'all') params.set('status', filters.status)
        if (filters.modelId && filters.modelId !== 'all') params.set('modelId', filters.modelId)
        params.set('timeRange', filters.timeRange)

        const res = await fetch(`/api/runs?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch runs')
        const data = await res.json()

        if (reset) {
          setRuns(data.runs)
        } else {
          setRuns((prev) => [...prev, ...data.runs])
        }
        setCursor(data.nextCursor)
        setHasMore(data.hasMore)
      } catch (err) {
        console.error('[RunList] Fetch error:', (err as Error).message)
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  // Re-fetch when filters change
  useEffect(() => {
    fetchRuns(null, true)
  }, [filters, fetchRuns])

  // Intersection observer for scroll-based loading
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el || !hasMore || loading) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchRuns(cursor)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, hasMore, loading, fetchRuns])

  if (runs.length === 0 && !loading) {
    return (
      <div className="flex flex-col">
        <FilterPanel filters={filters} onFilterChange={setFilters} models={initialModels} />
        <EmptyState type="runs" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <FilterPanel filters={filters} onFilterChange={setFilters} models={initialModels} />
      <div className="mt-3 flex flex-col gap-2">
        {runs.map((run) => (
          <RunItem
            key={run.id}
            run={run}
            selected={selectedRunId === run.id}
            onClick={() => onSelectRun(selectedRunId === run.id ? null : run.id)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center text-sm text-foreground-muted">
          {loading ? '加载中...' : '滚动加载更多'}
        </div>
      )}
    </div>
  )
}
