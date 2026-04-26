import { db } from '@/db'
import { runs, spans } from '@/db/schema'

type WriteRunRecordParams = {
  runId: string
  prompt: string
  modelId: string
  status: 'success' | 'error'
  totalTokens: number
  latencyMs: number
  error?: string | null
  thinkingProcess?: Array<{ id: string; content: string; timestamp: number }>
  toolCalls?: Array<{ id: string; name: string; input: Record<string, unknown>; output: string; duration: number }>
  startTime: number
}

export async function writeRunRecord(params: WriteRunRecordParams): Promise<void> {
  try {
    const endTime = params.startTime + params.latencyMs

    // Insert run record
    await db.insert(runs).values({
      id: params.runId,
      prompt: params.prompt.slice(0, 8000),
      modelId: params.modelId,
      status: params.status,
      totalTokens: params.totalTokens,
      latencyMs: params.latencyMs,
      error: params.error ?? null,
      createdAt: endTime,
    })

    // Insert root span (LLM call)
    const rootSpanId = crypto.randomUUID()
    await db.insert(spans).values({
      id: rootSpanId,
      runId: params.runId,
      parentSpanId: null,
      type: 'llm',
      name: params.modelId,
      input: JSON.stringify({ prompt: params.prompt.slice(0, 1000) }),
      output: params.thinkingProcess?.[params.thinkingProcess.length - 1]?.content ?? null,
      error: params.error ?? null,
      startTime: params.startTime,
      endTime,
      duration: params.latencyMs,
      tokensUsed: params.totalTokens,
      depth: 0,
    })

    // Insert child spans (tool calls)
    for (const toolCall of params.toolCalls ?? []) {
      const toolDepth = Math.min(1, 4) // Tool calls are always depth 1
      await db.insert(spans).values({
        id: toolCall.id,
        runId: params.runId,
        parentSpanId: rootSpanId,
        type: 'tool',
        name: toolCall.name,
        input: JSON.stringify(toolCall.input),
        output: toolCall.output,
        error: null,
        startTime: params.startTime,
        endTime: params.startTime + toolCall.duration,
        duration: toolCall.duration,
        tokensUsed: 0,
        depth: toolDepth,
      })
    }
  } catch (err) {
    // Don't throw — failure to write history should not block the AI response
    console.error('[RunHistory] Failed to write run record:', (err as Error).message)
  }
}
