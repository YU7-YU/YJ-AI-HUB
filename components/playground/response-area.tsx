'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThinkingCard } from './thinking-card'
import { ToolCallCard } from './tool-call-card'
import { AnswerCard } from './answer-card'
import { cn } from '@/lib/utils'

type ResponseAreaProps = {
  partialObject: any
  isLoading: boolean
  className?: string
}

export function ResponseArea({ partialObject, isLoading, className }: ResponseAreaProps) {
  const [copied, setCopied] = useState(false)

  const hasThinking = partialObject?.thinkingProcess && partialObject.thinkingProcess.length > 0
  const hasToolCalls = partialObject?.toolCalls && partialObject.toolCalls.length > 0
  const hasAnswer = partialObject?.finalAnswer

  const hasContent = hasThinking || hasToolCalls || hasAnswer

  const handleCopyJson = async () => {
    try {
      const json = JSON.stringify(partialObject, null, 2)
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for unsupported browsers
    }
  }

  if (!hasContent && !isLoading) {
    return null
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Loading indicator at top */}
      {isLoading && !hasContent && (
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <span className="loading-dots inline-flex gap-1">
            <span>·</span>
            <span>·</span>
            <span>·</span>
          </span>
          <span>正在生成...</span>
        </div>
      )}

      {/* Thinking process */}
      {hasThinking && (
        <ThinkingCard steps={partialObject.thinkingProcess} />
      )}

      {/* Tool calls */}
      {hasToolCalls && (
        <ToolCallCard calls={partialObject.toolCalls} />
      )}

      {/* Final answer */}
      {hasAnswer && (
        <AnswerCard content={partialObject.finalAnswer} />
      )}

      {/* Copy JSON button */}
      {!isLoading && hasContent && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                复制 JSON
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
