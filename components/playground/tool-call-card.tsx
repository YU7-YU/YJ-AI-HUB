'use client'

import { ToolCall } from '@/shared/schemas/playground-response'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type ToolCallCardProps = {
  calls: ToolCall[] | undefined
  className?: string
}

export function ToolCallCard({ calls, className }: ToolCallCardProps) {
  if (!calls || calls.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-foreground-secondary">工具调用</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">工具名称</TableHead>
              <TableHead>输入</TableHead>
              <TableHead>输出</TableHead>
              <TableHead className="w-[80px]">耗时</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium text-primary">{call.name}</TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs text-foreground-muted">
                  {JSON.stringify(call.input)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs text-foreground-muted">
                  {call.output}
                </TableCell>
                <TableCell className="text-xs text-foreground-muted">
                  {call.duration}ms
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
