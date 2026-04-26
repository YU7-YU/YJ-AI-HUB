import { z } from 'zod'

// ThinkingStep — 思考过程中的单一步骤
export const ThinkingStepSchema = z.object({
  id: z.string(),
  content: z.string().max(2000),
  timestamp: z.number().min(0),
})

export type ThinkingStep = z.infer<typeof ThinkingStepSchema>

// ToolCall — 工具调用记录
export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  input: z.record(z.string(), z.unknown()),
  output: z.string(),
  duration: z.number().min(0),
})

export type ToolCall = z.infer<typeof ToolCallSchema>

// ResponseMetadata — 响应元信息
export const ResponseMetadataSchema = z.object({
  modelUsed: z.string(),
  totalTokens: z.number().min(0),
  latencyMs: z.number().min(0),
  finishedAt: z.number().min(0),
})

export type ResponseMetadata = z.infer<typeof ResponseMetadataSchema>

// AIResponse — 顶层结构化响应
export const PlaygroundResponseSchema = z.object({
  thinkingProcess: z.array(ThinkingStepSchema).min(0),
  toolCalls: z.array(ToolCallSchema).min(0),
  finalAnswer: z.string().max(10000),
  metadata: ResponseMetadataSchema,
})

export type PlaygroundResponse = z.infer<typeof PlaygroundResponseSchema>
