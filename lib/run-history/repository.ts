import { db } from '@/db'
import { runs, spans } from '@/db/schema'
import { eq, lt, and, desc, sql, gte } from 'drizzle-orm'
import { FlatSpan, Run } from '@/shared/schemas/run-history'

type RunQuery = {
  cursor: string | null
  limit: number
  status: 'all' | 'success' | 'error'
  modelId: string | null
  timeRange: '1h' | '24h' | '7d' | 'custom'
  customFrom: number | null
  customTo: number | null
}

export async function getRunsList(query: RunQuery): Promise<{
  runs: Run[]
  nextCursor: string | null
  hasMore: boolean
}> {
  const limit = Math.min(query.limit, 50)
  const fetchLimit = limit + 1 // Fetch one extra to determine hasMore

  const now = Date.now()
  let timeCondition = sql`1 = 1`

  if (query.timeRange === 'custom' && query.customFrom) {
    timeCondition = sql`${runs.createdAt} >= ${query.customFrom}`
    if (query.customTo) {
      timeCondition = sql`${runs.createdAt} >= ${query.customFrom} AND ${runs.createdAt} <= ${query.customTo}`
    }
  } else if (query.timeRange === '1h') {
    timeCondition = sql`${runs.createdAt} >= ${now - 3600000}`
  } else if (query.timeRange === '24h') {
    timeCondition = sql`${runs.createdAt} >= ${now - 86400000}`
  } else if (query.timeRange === '7d') {
    timeCondition = sql`${runs.createdAt} >= ${now - 604800000}`
  }

  const conditions = [timeCondition]
  if (query.cursor) {
    conditions.push(lt(runs.createdAt, sql`(SELECT created_at FROM runs WHERE id = ${query.cursor})`))
  }
  if (query.status !== 'all') {
    conditions.push(eq(runs.status, query.status))
  }
  if (query.modelId) {
    conditions.push(eq(runs.modelId, query.modelId))
  }

  const results = await db
    .select()
    .from(runs)
    .where(and(...conditions))
    .orderBy(desc(runs.createdAt))
    .limit(fetchLimit)

  const hasMore = results.length > limit
  const items = results.slice(0, limit)

  return {
    runs: items.map((r) => ({
      id: r.id,
      prompt: r.prompt,
      modelId: r.modelId,
      status: r.status as 'success' | 'error',
      totalTokens: r.totalTokens,
      latencyMs: r.latencyMs,
      error: r.error,
      createdAt: r.createdAt,
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore,
  }
}

export async function getRunDetail(runId: string): Promise<{
  run: Run
  flatSpans: FlatSpan[]
} | null> {
  const runResult = await db
    .select()
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1)

  if (runResult.length === 0) return null

  const run = runResult[0]
  const runData: Run = {
    id: run.id,
    prompt: run.prompt,
    modelId: run.modelId,
    status: run.status as 'success' | 'error',
    totalTokens: run.totalTokens,
    latencyMs: run.latencyMs,
    error: run.error,
    createdAt: run.createdAt,
  }

  const spanResults = await db
    .select()
    .from(spans)
    .where(eq(spans.runId, runId))
    .orderBy(spans.depth, spans.startTime)

  const flatSpans: FlatSpan[] = spanResults.map((s) => ({
    id: s.id,
    runId: s.runId,
    parentSpanId: s.parentSpanId,
    type: s.type as 'llm' | 'tool' | 'system',
    name: s.name,
    input: s.input ? JSON.parse(s.input) : null,
    output: s.output,
    error: s.error,
    startTime: s.startTime,
    endTime: s.endTime,
    duration: s.duration,
    tokensUsed: s.tokensUsed,
    depth: s.depth,
  }))

  return { run: runData, flatSpans }
}

export async function getDistinctModels(): Promise<string[]> {
  const results = await db
    .select({ modelId: runs.modelId })
    .from(runs)
    .groupBy(runs.modelId)
    .orderBy(desc(runs.createdAt))

  return results.map((r) => r.modelId)
}
