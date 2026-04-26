'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FilterState = {
  status: 'all' | 'success' | 'error'
  modelId: 'all' | string
  timeRange: '1h' | '24h' | '7d' | 'custom'
}

type FilterPanelProps = {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  models: string[]
  className?: string
}

export function FilterPanel({ filters, onFilterChange, models, className }: FilterPanelProps) {
  const update = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.modelId !== 'all' || filters.timeRange !== '24h'

  return (
    <div className={cn('space-y-3 rounded-lg border border-border bg-card p-3', className)}>
      {/* Status filter */}
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground-secondary">状态</label>
        <Select value={filters.status} onValueChange={(v) => update('status', v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="success">成功</SelectItem>
            <SelectItem value="error">失败</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model filter */}
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground-secondary">模型</label>
        <Select value={filters.modelId} onValueChange={(v) => update('modelId', v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="全部模型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部模型</SelectItem>
            {models.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time range filter */}
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground-secondary">时间范围</label>
        <Select value={filters.timeRange} onValueChange={(v) => update('timeRange', v as FilterState['timeRange'])}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">最近 1 小时</SelectItem>
            <SelectItem value="24h">最近 24 小时</SelectItem>
            <SelectItem value="7d">最近 7 天</SelectItem>
            <SelectItem value="custom">自定义</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFilterChange({ status: 'all', modelId: 'all', timeRange: '24h' })
          }
          className="h-7 w-full text-xs"
        >
          重置筛选
        </Button>
      )}
    </div>
  )
}
