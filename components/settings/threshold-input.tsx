'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { getAlertThreshold, setAlertThreshold } from '@/lib/settings/storage'

const MIN = 0.01
const MAX = 10
const STEP = 0.01

type ThresholdInputProps = {
  currentCost?: number
}

export function ThresholdInput({ currentCost }: ThresholdInputProps) {
  const [value, setValue] = useState(() => getAlertThreshold())

  useEffect(() => {
    setValue(getAlertThreshold())
  }, [])

  const isOver = typeof currentCost === 'number' && currentCost > value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value)
    if (!Number.isNaN(raw) && raw >= MIN && raw <= MAX) {
      setValue(raw)
      setAlertThreshold(raw)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground-muted">$</span>
        <Input
          type="number"
          min={MIN}
          max={MAX}
          step={STEP}
          value={value}
          onChange={handleChange}
          aria-label="预警阈值（美元）"
          aria-describedby={isOver ? 'threshold-warning' : undefined}
          className={`h-9 w-32 font-mono text-sm ${isOver ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        <span className="text-xs text-foreground-muted">
          范围 ${MIN} ~ ${MAX}
        </span>
      </div>
      {isOver && (
        <p id="threshold-warning" className="text-xs text-destructive">
          这次调用估计会花 ${currentCost?.toFixed(4)}，超过你设的 ${value.toFixed(2)} 阈值，确定要发吗？
        </p>
      )}
    </div>
  )
}
