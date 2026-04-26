function formatTimeMs(ms: number): string {
  if (ms < 1000) return `+${ms}ms`
  return `+${(ms / 1000).toFixed(1)}s`
}

type TimeAxisProps = {
  totalMs: number
  width: number
}

export function TimeAxis({ totalMs, width }: TimeAxisProps) {
  const tickCount = Math.max(2, Math.floor(width / 80))
  const stepMs = totalMs / tickCount
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => ({
    x: (i / tickCount) * width,
    label: formatTimeMs(Math.round(i * stepMs)),
  }))

  return (
    <g className="select-none">
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.x}
            y1={0}
            x2={tick.x}
            y2={16}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
          <text
            x={tick.x}
            y={14}
            textAnchor="middle"
            className="fill-foreground-muted"
            fontSize={10}
          >
            {tick.label}
          </text>
        </g>
      ))}
    </g>
  )
}
