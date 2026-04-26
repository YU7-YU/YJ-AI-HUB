'use client'

import { useState, useCallback } from 'react'
import { SpanNode } from '@/shared/schemas/run-history'
import { SpanDetail } from './span-detail'

const ROW_HEIGHT = 32
const INDENT_PER_LEVEL = 24
const BAR_HEIGHT = ROW_HEIGHT - 8

type TraceLayout = {
  totalMs: number
  minTime: number
  pxPerMs: number
}

type SpanRowProps = {
  span: SpanNode
  layout: TraceLayout
  svgWidth: number
}

function timeToX(startTime: number, layout: TraceLayout): number {
  return (startTime - layout.minTime) * layout.pxPerMs
}

function durationToWidth(duration: number, layout: TraceLayout): number {
  return Math.max(2, duration * layout.pxPerMs)
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getSpanFillColor(duration: number): string {
  // Use CSS variables for theme colors
  if (duration < 200) return 'var(--color-success, #22c55e)'
  if (duration <= 1000) return 'var(--color-warning, #f59e0b)'
  return 'var(--color-destructive, #ef4444)'
}

function getSpanStrokeColor(type: string): string {
  switch (type) {
    case 'llm':
      return 'var(--color-primary, #3b82f6)'
    case 'tool':
      return 'var(--color-chart-4, #a855f7)'
    default:
      return 'var(--color-foreground-muted, #71717a)'
  }
}

export function SpanRow({ span, layout, svgWidth }: SpanRowProps) {
  const [expanded, setExpanded] = useState(false)
  const x = timeToX(span.startTime, layout)
  const w = durationToWidth(span.duration, layout)
  const indent = span.depth * INDENT_PER_LEVEL

  const handleClick = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return (
    <g
      transform={`translate(${indent}, 0)`}
      className="cursor-pointer"
      onClick={handleClick}
      role="button"
      aria-label={`Span: ${span.name}, ${span.duration}ms`}
    >
      {/* Span bar */}
      <rect
        x={x}
        y={4}
        width={Math.min(w, svgWidth - indent)}
        height={BAR_HEIGHT}
        rx={4}
        fill={getSpanFillColor(span.duration)}
        fillOpacity={0.7}
        stroke={getSpanStrokeColor(span.type)}
        strokeWidth={1.5}
      />
      {/* Label */}
      <text
        x={Math.max(x + 4, 0)}
        y={20}
        fontSize={11}
        fill="var(--color-card-foreground, #e5e5e5)"
        style={{ pointerEvents: 'none' }}
      >
        {span.name.length > 30 ? span.name.slice(0, 30) + '…' : span.name}
      </text>
      {/* Duration */}
      {x + w + 40 < svgWidth - indent && (
        <text
          x={x + w + 4}
          y={20}
          fontSize={10}
          fill="var(--color-foreground-muted, #71717a)"
          style={{ pointerEvents: 'none' }}
        >
          {formatMs(span.duration)}
        </text>
      )}

      {/* ForeignObject for detail (HTML inside SVG) */}
      {expanded && (
        <foreignObject
          x={indent}
          y={ROW_HEIGHT}
          width={Math.max(280, svgWidth - indent)}
          height={200}
        >
          <div className="p-1">
            <SpanDetail span={span} />
          </div>
        </foreignObject>
      )}
    </g>
  )
}
