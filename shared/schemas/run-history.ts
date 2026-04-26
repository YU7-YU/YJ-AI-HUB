import { z } from 'zod'

// --- Run 实体 ---

export const RunStatusSchema = z.enum(['success', 'error'])

export const RunSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string().max(8000),
  modelId: z.string(),
  status: RunStatusSchema,
  totalTokens: z.number().int().min(0),
  latencyMs: z.number().int().min(0),
  error: z.string().nullable(),
  createdAt: z.number().int().min(0),
})

export type Run = z.infer<typeof RunSchema>

// --- Span 实体（扁平结构，数据库直出） ---

export const SpanTypeSchema = z.enum(['llm', 'tool', 'system'])

export const FlatSpanSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  parentSpanId: z.string().uuid().nullable(),
  type: SpanTypeSchema,
  name: z.string(),
  input: z.record(z.string(), z.unknown()).nullable(),
  output: z.string().nullable(),
  error: z.string().nullable(),
  startTime: z.number().int().min(0),
  endTime: z.number().int().min(0),
  duration: z.number().int().min(0),
  tokensUsed: z.number().int().min(0),
  depth: z.number().int().min(0).max(4),
})

export type FlatSpan = z.infer<typeof FlatSpanSchema>

// --- Span 树结构（前端重建树，递归） ---

// Recursive type: SpanNode may contain children of the same type
// Zod doesn't support recursive schema natively, so we use lazy()
export const SpanNodeSchema: z.ZodType<{
  id: string
  runId: string
  parentSpanId: string | null
  type: z.infer<typeof SpanTypeSchema>
  name: string
  input: Record<string, unknown> | null
  output: string | null
  error: string | null
  startTime: number
  endTime: number
  duration: number
  tokensUsed: number
  depth: number
  children: z.infer<typeof SpanNodeSchema>[]
}> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    runId: z.string().uuid(),
    parentSpanId: z.string().uuid().nullable(),
    type: SpanTypeSchema,
    name: z.string(),
    input: z.record(z.string(), z.unknown()).nullable(),
    output: z.string().nullable(),
    error: z.string().nullable(),
    startTime: z.number().int().min(0),
    endTime: z.number().int().min(0),
    duration: z.number().int().min(0),
    tokensUsed: z.number().int().min(0),
    depth: z.number().int().min(0).max(4),
    children: z.array(SpanNodeSchema),
  })
)

export type SpanNode = z.infer<typeof SpanNodeSchema>

// --- Cursor-based 分页查询参数 ---

export const RunQuerySchema = z.object({
  cursor: z.string().uuid().nullable().default(null),
  limit: z.number().int().min(1).max(50).default(50),
  status: z.enum(['all', 'success', 'error']).default('all'),
  modelId: z.string().nullable().default(null),
  timeRange: z.enum(['1h', '24h', '7d', 'custom']).default('24h'),
  customFrom: z.number().int().min(0).nullable().default(null),
  customTo: z.number().int().min(0).nullable().default(null),
})

export type RunQuery = z.infer<typeof RunQuerySchema>

// --- 分页响应 ---

export const PaginatedRunsSchema = z.object({
  runs: z.array(RunSchema),
  nextCursor: z.string().uuid().nullable(),
  hasMore: z.boolean(),
})

export type PaginatedRuns = z.infer<typeof PaginatedRunsSchema>

// --- Run 详情（含 Trace 树） ---

export const RunDetailSchema = RunSchema.extend({
  spans: z.array(SpanNodeSchema),
})

export type RunDetail = z.infer<typeof RunDetailSchema>
