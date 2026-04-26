'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SpanNode } from '@/shared/schemas/run-history'
import { cn } from '@/lib/utils'

type SpanDetailProps = {
  span: SpanNode
}

function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

export function SpanDetail({ span }: SpanDetailProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-1 ml-4 border-l-2 border-border pl-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-foreground-muted transition-colors hover:text-foreground"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {expanded ? '收起详情' : '展开详情'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 text-xs">
          {/* Input */}
          {span.input && (
            <div>
              <span className="font-medium text-foreground-secondary">输入</span>
              <pre className="mt-1 overflow-x-auto rounded-md bg-background-subtle p-2 font-mono text-foreground-muted">
                {formatJson(span.input)}
              </pre>
            </div>
          )}

          {/* Output */}
          {span.output && (
            <div>
              <span className="font-medium text-foreground-secondary">输出</span>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-background-subtle p-2 font-mono text-foreground">
                {span.output}
              </pre>
            </div>
          )}

          {/* Error */}
          {span.error && (
            <div>
              <span className="font-medium text-destructive">错误</span>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-destructive/10 p-2 font-mono text-destructive">
                {span.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
