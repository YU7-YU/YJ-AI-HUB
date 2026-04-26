'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Run, FlatSpan, SpanNode } from '@/shared/schemas/run-history'
import { buildSpanTree, getTraceTimeRange } from '@/lib/run-history/span-tree'
import { TimeAxis } from './time-axis'
import { SpanRow } from './span-row'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorDisplay } from '@/components/playground/error-display'

type TraceViewerProps = {
  runId: string | null
}

function flattenTree(nodes: SpanNode[], result: SpanNode[] = []): SpanNode[] {
  for (const node of nodes) {
    result.push(node)
    if (node.children.length > 0) {
      flattenTree(node.children, result)
    }
  }
  return result
}

export function TraceViewer({ runId }: TraceViewerProps) {
  const [run, setRun] = useState<Run | null>(null)
  const [flatSpans, setFlatSpans] = useState<FlatSpan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ type: string; message: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgWidth, setSvgWidth] = useState(600)

  // Measure container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgWidth(Math.max(entry.contentRect.width, 300))
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Fetch run detail when runId changes
  useEffect(() => {
    if (!runId) {
      setRun(null)
      setFlatSpans([])
      return
    }

    let cancelled = false
    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/runs/${runId}`)
        if (res.status === 404) {
          if (!cancelled) setError({ type: 'unknown', message: '未找到该条记录' })
          return
        }
        if (!res.ok) throw new Error('请求失败')
        const data = await res.json()
        if (!cancelled) {
          setRun(data.run)
          setFlatSpans(data.flatSpans)
        }
      } catch (err) {
        if (!cancelled) setError({ type: 'network', message: (err as Error).message })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      cancelled = true
    }
  }, [runId])

  if (!runId) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorDisplay
          type={error.type as 'auth' | 'rate_limit' | 'context_length' | 'network' | 'unknown'}
          message={error.message}
        />
      </div>
    )
  }

  if (flatSpans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-foreground-muted">
        暂无 Trace 数据
      </div>
    )
  }

  const tree = buildSpanTree(flatSpans)
  const flatList = flattenTree(tree)
  const { total: totalMs, min: minTime } = getTraceTimeRange(flatSpans)
  const layout = {
    totalMs,
    minTime,
    pxPerMs: totalMs > 0 ? (svgWidth - 100) / totalMs : 1,
  }

  const svgHeight = flatList.length * 32 + 30

  return (
    <div ref={containerRef} className="overflow-auto p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground-secondary">Trace 瀑布图</h3>
        {run && (
          <span className="text-xs text-foreground-muted">
            {run.latencyMs}ms · {run.totalTokens} tokens
          </span>
        )}
      </div>
      <svg
        width={svgWidth}
        height={svgHeight}
        className="overflow-visible"
        role="img"
        aria-label="Trace waterfall chart showing span durations"
      >
        {/* Time axis */}
        <g transform="translate(100, 0)">
          <TimeAxis totalMs={totalMs} width={svgWidth - 100} />
        </g>

        {/* Span rows */}
        <g transform="translate(0, 20)">
          {flatList.map((span, i) => (
            <g key={span.id} transform={`translate(0, ${i * 32})`}>
              {/* Indentation label */}
              {span.depth > 0 && (
                <text
                  x={span.depth * 24 - 8}
                  y={20}
                  fontSize={9}
                  fill="var(--color-foreground-disabled, #52525b)"
                  style={{ pointerEvents: 'none' }}
                >
                  {'└─'}
                </text>
              )}
              <SpanRow span={span} layout={layout} svgWidth={svgWidth - 100} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
