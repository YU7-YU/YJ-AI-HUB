'use client'

import { useState } from 'react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { ThinkingStepSchema, ToolCallSchema } from '@/shared/schemas/playground-response'
import { Header } from '@/components/layout/header'
import { ModelSelector } from '@/components/playground/model-selector'
import { PromptInput } from '@/components/playground/prompt-input'
import { ResponseArea } from '@/components/playground/response-area'
import { ErrorDisplay, LoadingState } from '@/components/playground/error-display'
import { TokenEstimator } from '@/components/playground/token-estimator'
import { models } from '@/lib/playground/models'
import { z } from 'zod'

const StreamSchema = z.object({
  thinkingProcess: z.array(ThinkingStepSchema),
  toolCalls: z.array(ToolCallSchema),
  finalAnswer: z.string(),
})

type PlaygroundError = {
  type: 'auth' | 'rate_limit' | 'context_length' | 'network' | 'unknown'
  message: string
  detail?: string
}

export default function PlaygroundPage() {
  const [selectedModel, setSelectedModel] = useState(models[0].id)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<PlaygroundError | null>(null)

  const {
    object: partialObject,
    isLoading,
    error: useObjectError,
    submit,
    clear,
  } = useObject({
    api: '/api/playground/stream',
    schema: StreamSchema,
    // Custom fetch to intercept error responses and parse JSON body
    fetch: async (url, options) => {
      const res = await globalThis.fetch(url, options)
      if (!res.ok) {
        try {
          const errorJson: PlaygroundError = await res.json()
          setError({
            type: errorJson.type,
            message: errorJson.message,
            detail: errorJson.detail,
          })
        } catch {
          setError({ type: 'unknown', message: '未知错误' })
        }
        // Return a minimal valid SSE stream so useObject doesn't crash
        return new Response(
          `data: {"thinkingProcess":[],"toolCalls":[],"finalAnswer":""}\n\n`,
          { headers: { 'Content-Type': 'text/plain' } }
        )
      }
      return res
    },
    onError: (err) => {
      setError({ type: 'unknown', message: err.message })
    },
  })

  const handleSend = () => {
    if (!prompt.trim() || isLoading) return
    setError(null)
    submit({ model: selectedModel, prompt })
  }

  const handleClear = () => {
    setPrompt('')
    clear()
  }

  // Handle API errors
  const displayError = error || (useObjectError ? { type: 'unknown' as const, message: useObjectError.message } : null)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 lg:px-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Playground</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              多模型流式测试 — 选择模型，输入 prompt，查看结构化响应
            </p>
          </div>

          {/* Model selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground-secondary">
              模型
            </label>
            <ModelSelector
              models={models.map((m) => ({ id: m.id, name: m.name }))}
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={isLoading}
            />
          </div>

          {/* Prompt input */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium text-foreground-secondary">
              输入
            </label>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSend={handleSend}
              onClear={handleClear}
              isLoading={isLoading}
              disabled={false}
            />
            <div className="mt-2">
              <TokenEstimator text={prompt} />
            </div>
          </div>

          {/* Response area */}
          {displayError && !isLoading ? (
            <ErrorDisplay
              type={displayError.type as 'auth' | 'rate_limit' | 'context_length' | 'network' | 'unknown'}
              message={displayError.message}
              detail={displayError.detail}
            />
          ) : isLoading ? (
            <div className="space-y-6">
              <LoadingState />
              <ResponseArea partialObject={partialObject} isLoading={isLoading} />
            </div>
          ) : (
            <ResponseArea partialObject={partialObject} isLoading={isLoading} />
          )}
        </div>
      </main>
    </div>
  )
}
