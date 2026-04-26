import { sqliteTable, text, integer, index, foreignKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Runs 表 — 每次 Playground 调用产生一条记录
export const runs = sqliteTable(
  'runs',
  {
    id: text('id').primaryKey(),
    prompt: text('prompt').notNull(),
    modelId: text('model_id').notNull(),
    status: text('status').notNull().default('success'),
    totalTokens: integer('total_tokens').notNull().default(0),
    latencyMs: integer('latency_ms').notNull().default(0),
    error: text('error'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (table) => [
    // 列表查询：按创建时间倒序，游标分页用 (id, created_at)
    index('idx_runs_created_at').on(table.createdAt),
    index('idx_runs_status').on(table.status),
    index('idx_runs_model_id').on(table.modelId),
  ]
)

// Spans 表 — 自关联扁平表，通过 parent_span_id 重建树
export const spans = sqliteTable(
  'spans',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    parentSpanId: text('parent_span_id'),
    type: text('type').notNull(), // 'llm' | 'tool' | 'system'
    name: text('name').notNull(),
    input: text('input'), // JSON 字符串
    output: text('output'),
    error: text('error'),
    startTime: integer('start_time', { mode: 'number' }).notNull(),
    endTime: integer('end_time', { mode: 'number' }).notNull(),
    duration: integer('duration').notNull(),
    tokensUsed: integer('tokens_used').notNull().default(0),
    depth: integer('depth').notNull().default(0),
  },
  (table) => [
    // 查询某 Run 的所有 spans
    index('idx_spans_run_id').on(table.runId),
    // 按 runId + depth 排序，保证层级顺序
    index('idx_spans_run_depth').on(table.runId, table.depth),
    foreignKey({
      columns: [table.runId],
      foreignColumns: [runs.id],
      name: 'fk_span_run',
    }),
  ]
)
