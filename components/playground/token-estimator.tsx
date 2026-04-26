'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import { countTokens } from '@/lib/token-counter'
import { calculateCost, formatCost, getCostLevel } from '@/lib/cost-calculator'
import { getDefaultModel, getAlertThreshold } from '@/lib/settings/storage'

type TokenEstimatorProps = {
  text: string
}

export function TokenEstimator({ text }: TokenEstimatorProps) {
  const [modelId, setModelId] = useState(() => getDefaultModel())
  const threshold = getAlertThreshold()

  // Listen for default model changes from Settings
  useEffect(() => {
    const handler = (e: Event) => {
      setModelId((e as CustomEvent).detail.modelId)
    }
    window.addEventListener('agenthub:defaultModelChanged', handler)
    return () => window.removeEventListener('agenthub:defaultModelChanged', handler)
  }, [])

  // Debounced token estimation (300ms)
  const [debouncedText, setDebouncedText] = useState(text)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(text), 300)
    return () => clearTimeout(timer)
  }, [text])

  const estimate = useMemo(() => {
    if (!debouncedText.trim() || !modelId) return null

    const tokens = countTokens(debouncedText)
    const cost = calculateCost(tokens, modelId)
    const level = getCostLevel(cost, threshold)

    return { tokens, cost, level }
  }, [debouncedText, modelId, threshold])

  const colorMap = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-destructive',
  }

  if (!estimate) return null

  return (
    <div className="flex items-center justify-end gap-1.5 text-xs">
      <span className={colorMap[estimate.level]}>
        约 {estimate.tokens.toLocaleString()} tokens · {formatCost(estimate.cost)}
      </span>
    </div>
  )
}
