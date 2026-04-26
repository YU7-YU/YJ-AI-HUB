'use client'

import { AlertTriangle, Loader2, XCircle, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ErrorType = 'auth' | 'rate_limit' | 'context_length' | 'network' | 'unknown'

type ErrorDisplayProps = {
  type: ErrorType
  message: string
  detail?: string
  className?: string
}

const errorConfig: Record<ErrorType, { icon: React.ReactNode; color: string }> = {
  auth: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-destructive',
  },
  rate_limit: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-warning',
  },
  context_length: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-warning',
  },
  network: {
    icon: <WifiOff className="h-5 w-5" />,
    color: 'text-destructive',
  },
  unknown: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-destructive',
  },
}

export function ErrorDisplay({ type, message, detail, className }: ErrorDisplayProps) {
  const config = errorConfig[type]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      <span className={cn('mt-0.5 shrink-0', config.color)}>{config.icon}</span>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">正在思考中...</span>
    </div>
  )
}
