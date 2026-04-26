'use client'

import { useState } from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const MAX_LENGTH = 8000

type PromptInputProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onClear: () => void
  isLoading: boolean
  disabled?: boolean
  className?: string
}

export function PromptInput({
  value,
  onChange,
  onSend,
  onClear,
  isLoading,
  disabled = false,
  className,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  const canSend = value.trim().length > 0 && !disabled && !isLoading
  const charCount = value.length
  const isOverLimit = charCount > MAX_LENGTH

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题... (Cmd/Ctrl+Enter 发送)"
          maxLength={MAX_LENGTH}
          rows={3}
          disabled={disabled || isLoading}
          className={cn(
            'resize-none pr-24',
            isOverLimit && 'border-destructive'
          )}
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          {isLoading ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={onClear}
              className="h-8 w-8 p-0"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSend}
              disabled={!canSend}
              className="h-8 w-8 p-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              'text-xs',
              isOverLimit
                ? 'text-destructive'
                : charCount > MAX_LENGTH * 0.9
                ? 'text-warning'
                : 'text-foreground-muted'
            )}
          >
            {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
          {isOverLimit && (
            <span className="text-xs text-destructive">超出上下文限制</span>
          )}
        </div>
        {value && !isLoading && (
          <button
            onClick={onClear}
            className="text-xs text-foreground-muted transition-colors hover:text-foreground"
          >
            清空
          </button>
        )}
      </div>
    </div>
  )
}
