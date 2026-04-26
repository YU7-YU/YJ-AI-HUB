'use client'

import { FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  type: 'runs' | 'trace'
  className?: string
}

export function EmptyState({ type, className }: EmptyStateProps) {
  if (type === 'runs') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-foreground-muted" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium text-foreground">空空如也，先去 Playground 聊一次吧</p>
          <Link
            href="/playground"
            className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary-hover"
          >
            前往 Playground
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileText className="h-8 w-8 text-foreground-muted" />
      </div>
      <p className="text-base font-medium text-foreground-secondary">选择一条 Run 查看详情</p>
    </div>
  )
}
