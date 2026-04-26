'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type AnswerCardProps = {
  content: string | undefined
  className?: string
}

export function AnswerCard({ content, className }: AnswerCardProps) {
  if (!content) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-foreground-secondary">回答</h3>
      <div className="rounded-lg border border-border bg-card p-4">
        <pre className="whitespace-pre-wrap text-sm text-foreground">{content}</pre>
      </div>
    </div>
  )
}
