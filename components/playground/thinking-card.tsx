'use client'

import { ThinkingStep } from '@/shared/schemas/playground-response'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type ThinkingCardProps = {
  steps: ThinkingStep[] | undefined
  className?: string
}

export function ThinkingCard({ steps, className }: ThinkingCardProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-foreground-secondary">思考过程</h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex shrink-0 flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-foreground">{step.content}</p>
              {step.timestamp > 0 && (
                <p className="text-xs text-foreground-muted">
                  {new Date(step.timestamp).toLocaleTimeString('zh-CN')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
