{/* [Prep-02] AgentHub Skeleton Card Component */}
{/* [Prep-02] 修复 #3: 加载态 - 骨架屏 pulse 动效 */}

import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    // [Prep-02] 修复 #1: 压缩内边距与尺寸
    <div className={cn('rounded-lg border border-border bg-card p-3.5', className)}>
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="skeleton h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>

      {/* Description */}
      <div className="mt-2.5 space-y-1.5">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-4/5" />
      </div>

      {/* Badges */}
      <div className="mt-2.5 flex gap-1">
        <div className="skeleton h-5 w-12 rounded-md" />
        <div className="skeleton h-5 w-14 rounded-md" />
        <div className="skeleton h-5 w-10 rounded-md" />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="skeleton h-3.5 w-3.5 rounded-full" />
          <div className="skeleton h-3 w-8" />
          <div className="skeleton ml-1 h-3 w-12" />
        </div>
        <div className="skeleton h-3 w-10" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}

// [Prep-02] 修复 #3: 运行历史骨架屏
export function SkeletonRunItem() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5">
      <div className="skeleton h-3.5 w-3.5 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3.5 w-24" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="skeleton h-3 w-12" />
    </div>
  )
}
