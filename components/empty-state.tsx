{/* [Prep-02] AgentHub Empty State Component */}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

// [Prep-02] 修复 #3: 统一空态样式 - SVG 线条风格，1.5px stroke
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {/* [Prep-02] 修复 #3: 图标容器 */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background-elevated">
        {icon || (
          <svg
            className="h-7 w-7 text-foreground-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        )}
      </div>
      {/* [Prep-02] 修复 #3: 文案样式 - 15字以内 */}
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-foreground-secondary">{description}</p>
      )}
      {/* [Prep-02] 修复 #3: 只有 1 个主 CTA（有时加 1 个次 CTA）*/}
      {(action || secondaryAction) && (
        <div className="mt-4 flex items-center gap-2">
          {action && (
            <Button
              className="h-8 text-sm focus-ring"
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <Link href={action.href}>{action.label}</Link>
              ) : (
                action.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              className="h-8 text-sm focus-ring"
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
