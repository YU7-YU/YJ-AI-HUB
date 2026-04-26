{/* [Prep-02] AgentHub Agent Card Component */}

import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Agent } from '@/lib/mock-data'

interface AgentCardProps {
  agent: Agent
  className?: string
}

export function AgentCard({ agent, className }: AgentCardProps) {
  return (
    <Link href={`/agent/${agent.id}`} className={cn('group block', className)}>
      {/* [Prep-02] 修复 #2: Card hover 态 - border 加深，背景不变 */}
      {/* [Prep-02] 修复 #2: focus 态 - 2px 主色 40% ring */}
      {/* [Prep-02] 修复 #1: 压缩内边距和字号 */}
      <div className="flex h-full flex-col rounded-lg border border-border bg-card p-3.5 transition-colors focus-ring group-focus-visible:ring-2 group-focus-visible:ring-primary/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background hover:border-border-strong">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          {/* [Prep-02] 修复 #1: 缩小头像 */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background-elevated text-base font-semibold text-foreground">
            {agent.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            {/* [Prep-02] 修复 #2: 链接 hover 态 - 文字变色 */}
            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
              {agent.name}
            </h3>
            <p className="text-xs text-foreground-muted">{agent.author}</p>
          </div>
        </div>

        {/* Description */}
        {/* [Prep-02] 修复 #1: 行高和字号调整 */}
        <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-foreground-secondary">
          {agent.description}
        </p>

        {/* Capabilities */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="secondary" className="text-xs px-2 py-0.5">
              {cap}
            </Badge>
          ))}
          {agent.capabilities.length > 3 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              +{agent.capabilities.length - 3}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2.5">
          <div className="flex items-center gap-1 text-xs text-foreground-secondary">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span>{agent.rating.toFixed(1)}</span>
            <span className="ml-1.5 text-foreground-muted">
              {agent.runs >= 1000 ? `${(agent.runs / 1000).toFixed(0)}k` : agent.runs} 次运行
            </span>
          </div>
          <span className="text-xs font-medium text-foreground">
            {agent.price === null ? '免费' : `$${agent.price}/月`}
          </span>
        </div>
      </div>
    </Link>
  )
}
