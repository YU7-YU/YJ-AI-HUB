'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Run } from '@/shared/schemas/run-history'
import { cn } from '@/lib/utils'

type RunItemProps = {
  run: Run
  selected: boolean
  onClick: () => void
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export function RunItem({ run, selected, onClick }: RunItemProps) {
  const promptPreview = run.prompt.length > 80 ? run.prompt.slice(0, 80) + '...' : run.prompt

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:bg-background-subtle'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Status icon */}
        {run.status === 'success' ? (
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        ) : (
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm text-foreground">{promptPreview || '(空输入)'}</p>
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <span>{run.modelId}</span>
            <span>{formatMs(run.latencyMs)}</span>
            <span>{formatTokens(run.totalTokens)} tokens</span>
          </div>
        </div>
      </div>
    </button>
  )
}
