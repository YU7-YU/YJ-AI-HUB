import { streamObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { ThinkingStepSchema, ToolCallSchema } from '@/shared/schemas/playground-response'
import { getModelById } from '@/lib/playground/models'
import { waitUntil } from 'next/server'
import { writeRunRecord } from '@/lib/run-history/writer'

export const maxDuration = 60


// Schema sent to AI model — metadata excluded (server-computed, not model-generated).
// Client will compute latency/tokens from stream timing + headers.
const StreamSchema = z.object({
  thinkingProcess: z.array(ThinkingStepSchema),
  toolCalls: z.array(ToolCallSchema),
  finalAnswer: z.string(),
})

type ErrorResponse = {
  type: 'auth' | 'rate_limit' | 'context_length' | 'network' | 'unknown'
  message: string
  detail?: string
}

function errorResponse(type: ErrorResponse['type'], message: string, detail?: string) {
  return Response.json({ type, message, detail } as ErrorResponse, { status: 500 })
}

function classifyError(error: unknown): ErrorResponse {
  const err = error as { status?: number; message?: string; error?: { message?: string } }
  const status = err.status
  const rawMessage = err.error?.message ?? err.message ?? '未知错误'

  if (status === 401 || status === 403) {
    return { type: 'auth', message: 'API Key 无效或已过期' }
  }
  if (status === 429) {
    return { type: 'rate_limit', message: '请求过于频繁，请稍后重试', detail: rawMessage }
  }
  if (status === 400 || status === 413 || rawMessage.includes('context_length') || rawMessage.includes('maximum context')) {
    return { type: 'context_length', message: '输入超出模型上下文限制，请缩短 prompt' }
  }
  if (status && status >= 500) {
    return { type: 'network', message: '连接失败，请检查网络后重试', detail: rawMessage }
  }
  if (rawMessage.includes('timeout') || rawMessage.includes('fetch') || rawMessage.includes('network')) {
    return { type: 'network', message: '连接失败，请检查网络后重试', detail: rawMessage }
  }
  return { type: 'unknown', message: '服务暂时不可用', detail: rawMessage }
}

function createProvider(config: { envKey: string; envBaseUrl?: string; provider: string }) {
  const apiKey = process.env[config.envKey]
  if (!apiKey) {
    throw new Error('MISSING_API_KEY')
  }

  switch (config.provider) {
    case 'anthropic':
      return createAnthropic({ apiKey })
    case 'google':
      return createGoogleGenerativeAI({ apiKey })
    case 'openai':
    default: {
      const options: { apiKey: string; baseURL?: string } = { apiKey }
      if (config.envBaseUrl) {
        const baseUrl = process.env[config.envBaseUrl]
        if (baseUrl) options.baseURL = baseUrl
      }
      return createOpenAI(options)
    }
  }
}

export async function POST(req: Request) {
  try {
    const { model: modelId, prompt } = await req.json()

    if (!modelId || !prompt) {
      return Response.json(
        { type: 'unknown' as const, message: '缺少 model 或 prompt 参数' },
        { status: 400 }
      )
    }

    if (typeof prompt !== 'string' || prompt.length > 8000) {
      return errorResponse('context_length', '输入超出模型上下文限制，请缩短 prompt')
    }

    const modelConfig = getModelById(modelId)
    if (!modelConfig) {
      return Response.json(
        { type: 'unknown' as const, message: `不支持的模型: ${modelId}` },
        { status: 400 }
      )
    }

    const provider = createProvider(modelConfig)
    const runId = crypto.randomUUID()
    const startTime = Date.now()

    const result = await streamObject({
      model: provider.languageModel(modelId),
      schema: StreamSchema,
      prompt,
      onError: (error) => {
        console.error('[Playground] streamObject error:', (error as Error).message)
      },
    })

    // Asynchronously write run record, don't block the response
    waitUntil(
      writeRunRecord({
        runId,
        prompt,
        modelId: modelConfig.id,
        status: 'success',
        totalTokens: 0, // streamObject doesn't expose token usage in Edge runtime
        latencyMs: Date.now() - startTime,
        thinkingProcess: undefined,
        toolCalls: undefined,
        startTime,
      })
    )

    return result.toTextStreamResponse()
  } catch (error) {
    if ((error as { message?: string })?.message === 'MISSING_API_KEY') {
      return errorResponse('auth', 'API Key 无效或已过期')
    }
    const classified = classifyError(error)
    return errorResponse(classified.type, classified.message, classified.detail)
  }
}
