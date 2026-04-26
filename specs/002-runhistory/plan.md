# RunHistory 页 - 技术规划

## 1. 文件结构

### 新增文件

| 文件路径 | 职责 |
|----------|------|
| `db/schema.ts` | Drizzle 表定义（runs + spans，自关联） |
| `db/index.ts` | Drizzle client 初始化（Turso 连接） |
| `shared/schemas/run-history.ts` | Zod schema（Run, FlatSpan, SpanNode 递归, RunQuery, PaginatedRuns, RunDetail） |
| `lib/run-history/span-tree.ts` | 扁平 spans → 树重建工具函数 + 色阶映射 |
| `lib/run-history/repository.ts` | 数据库查询层（cursor 分页、筛选、详情查询） |
| `lib/run-history/writer.ts` | 写操作：Playground 调用后写入 runs + spans |
| `app/runs/page.tsx` | RunHistory 主页面（Server Component + Client 子组件） |
| `app/api/runs/route.ts` | 列表 API（cursor 分页、筛选） |
| `app/api/runs/[id]/route.ts` | 详情 API（单条 Run + spans 树） |
| `components/run-history/run-list.tsx` | 左栏 Run 列表（Client Component，滚动加载） |
| `components/run-history/run-item.tsx` | 单条 Run 行组件（状态 icon + 摘要 + 耗时 + token） |
| `components/run-history/filter-panel.tsx` | 筛选面板（状态 / 模型 / 时间范围） |
| `components/run-history/trace-viewer.tsx` | 右栏 Trace 瀑布图（Client Component，SVG 渲染） |
| `components/run-history/span-row.tsx` | 瀑布图单行（SVG span 条 + 展开详情） |
| `components/run-history/span-detail.tsx` | Span 展开详情（input/output/error） |
| `components/run-history/empty-state.tsx` | 空状态（无 Run / 未选中） |
| `components/run-history/time-axis.tsx` | 瀑布图时间刻度线（SVG） |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `app/api/playground/stream/route.ts` | 在 streamObject 成功后，通过 `ctx.waitUntil` 异步写入 runs + spans |
| `components/layout/header.tsx` | 导航栏新增 RunHistory 入口 |

---

## 2. 数据流

```
=== 写入路径 ===

用户在 Playground 发送 prompt
  ↓
/api/playground/stream POST (Edge Runtime)
  ↓
streamObject 调用 AI SDK → 流式返回
  ↓
streamObject 完成后:
  ctx.waitUntil(async () => {
    // 1. 插入 runs 记录
    db.insert(runs).values({ id, prompt, modelId, status, totalTokens, latencyMs, createdAt })

    // 2. 插入 spans（从 AI 响应中解析）
    //   - 根 span: LLM 调用
    //   - 子 span: toolCalls → 每个工具调用一个 span
    db.insert(spans).values([
      { id, runId, parentSpanId, type, name, input, output, error, startTime, endTime, duration, tokensUsed, depth },
      ...
    ])
  })
  ↓
立即返回 AI 响应（不阻塞等待写入）

=== 读取路径 ===

用户访问 /runs 页面
  ↓
app/runs/page.tsx (Server Component)
  ↓
直接 import repository，调用 getRunsList(query)
  ↓
  SELECT * FROM runs WHERE created_at < ? ORDER BY created_at DESC LIMIT 51
  ↓
返回首次渲染数据 → 首屏直出（无客户端 JS）
  ↓
左栏: run-list.tsx (Client Component, "use client")
  ↓
  初始数据从 props 注入
  ↓
  滚动到底部 → fetch /api/runs?cursor=xxx → 追加下一页
  ↓
右栏: trace-viewer.tsx (Client Component, "use client")
  ↓
  用户点击某条 Run → fetch /api/runs/[id]
  ↓
  返回 RunDetail（含 spans 树）
  ↓
  buildSpanTree(flatSpans) 重建嵌套树
  ↓
  getTraceTimeRange() 计算总时间范围
  ↓
  SVG 渲染瀑布图（时间 → x 坐标映射）
  ↓
  点击 span → 展开 span-detail.tsx
```

**技术标注**：
- Server Component 读列表：首屏无需 hydration，SEO 友好，直出 HTML
- Client Component 渲染瀑布图：需要 hover/click 交互、展开收起、SVG 事件绑定
- 写入走 API Route（Playground 调用后异步）；读取走 Server Component（首屏性能）

---

## 3. 索引设计

### runs 表

| 索引名 | 列 | 用途 |
|--------|-----|------|
| `idx_runs_created_at` | `created_at DESC` | 列表分页（cursor-based 按时间倒序） |
| `idx_runs_status` | `status` | 按状态筛选 |
| `idx_runs_model_id` | `model_id` | 按模型筛选 |
| `idx_runs_created_at_status` | `created_at DESC, status` | 复合：时间 + 状态组合筛选 |

### spans 表

| 索引名 | 列 | 用途 |
|--------|-----|------|
| `idx_spans_run_id` | `run_id` | 查询某 Run 的所有 spans |
| `idx_spans_run_depth` | `run_id, depth` | 瀑布图渲染：按 runId + depth 排序（保证层级顺序） |
| `idx_spans_run_start` | `run_id, start_time` | 瀑布图渲染：按 runId + startTime 排序（时间顺序） |

### Cursor 分页逻辑

```typescript
// 首次加载
const runs = await db
  .select()
  .from(runs)
  .where(and(
    sql`${runs.createdAt} < ${now}`,
    // 筛选条件
    status !== 'all' ? eq(runs.status, status) : undefined,
    modelId ? eq(runs.modelId, modelId) : undefined,
    timeRange === '1h' ? sql`${runs.createdAt} > ${now - 3600000}` : undefined,
    timeRange === '24h' ? sql`${runs.createdAt} > ${now - 86400000}` : undefined,
    timeRange === '7d' ? sql`${runs.createdAt} > ${now - 604800000}` : undefined,
  ))
  .orderBy(desc(runs.createdAt))
  .limit(51) // 多取 1 条判断 hasMore

const hasMore = runs.length > 50
const items = runs.slice(0, 50)
const nextCursor = hasMore ? items[items.length - 1].id : null
```

---

## 4. 瀑布图渲染算法

### 时间 → x 坐标映射

```typescript
interface TraceLayout {
  totalMs: number      // 整个 trace 的时间范围（max(endTime) - min(startTime)）
  minTime: number      // 最早 startTime
  pxPerMs: number      // 每毫秒对应的像素宽度
  rowHeight: number    // 每行高度（默认 32px）
  indentPerLevel: number  // 每层嵌套缩进（24px）
}

function timeToX(startTime: number, layout: TraceLayout): number {
  return (startTime - layout.minTime) * layout.pxPerMs
}

function durationToWidth(duration: number, layout: TraceLayout): number {
  return duration * layout.pxPerMs
}
```

### SVG 布局计算

```
SVG 总宽度 = 容器宽度（响应式，100%）
SVG 总高度 = spans 数量 × rowHeight + 时间刻度线高度(30px)

每个 span 行:
  <g transform="translate(indent, rowIndex * rowHeight)">
    <rect
      x={timeToX(span.startTime)}        // 起始位置
      y={4}                               // 行内垂直偏移
      width={durationToWidth(span.duration)}  // 条长度
      height={rowHeight - 8}              // 条高度
      fill={getDurationColor(span.duration)}
    />
    <text x={...} y={...}>{span.name}</text>
    <text x={...} y={...}>{span.duration}ms</text>
  </g>
```

### 嵌套处理

```
depth 0: 左缩进 0px
depth 1: 左缩进 24px
depth 2: 左缩进 48px
depth 3: 左缩进 72px
depth 4: 左缩进 96px（最大）

虚线连接:
  父 span 右侧 → 子 span 左侧，用 <line stroke-dasharray="4,4" />
```

### 完整渲染流程

```
1. API 返回 RunDetail（FlatSpan[]）
2. buildSpanTree(flatSpans) → SpanNode[]（递归树）
3. flattenTree(spanTree) → 带 indent 的列表（用于 SVG 行渲染）
4. getTraceTimeRange(flatSpans) → { min, max, total }
5. 计算 layout: { totalMs, minTime, pxPerMs = svgWidth / totalMs }
6. 遍历展平列表，每行渲染 <g> 元素
7. 顶部渲染时间刻度线（每 4px 阶梯对应一个时间间隔）
```

---

## 5. 技术决策

### D1: 为什么 Server Component 读列表？

**决策**：`/runs` 页面使用 Server Component 直接查 Drizzle

**理由**：
- 首屏无需 hydration，直接输出 HTML，性能最优（NFR-1）
- 列表数据静态性高（历史记录），适合 SSR
- 避免客户端 JS 首次加载时发起额外请求
- 筛选条件变化时通过路由参数触发 RSC 重新渲染（Next.js 内置缓存失效）

### D2: 为什么 Client Component 渲染瀑布图？

**决策**：`trace-viewer.tsx` 标记 `"use client"`

**理由**：
- 瀑布图需要 hover 高亮、click 展开/收起、拖拽缩放等交互
- SVG 事件绑定（onClick/onMouseEnter）在 Server Component 中不可用
- 详情展开是纯客户端状态管理，不需要服务端参与
- 与 Server Component 组合：左栏 SSR 渲染列表，右栏 CSR 渲染瀑布图

### D3: 为什么 SVG 不 Canvas？

**决策**：瀑布图使用 `<svg>` 渲染

**理由**：
- NFR-4 明确要求无障碍访问：SVG 每个 `<rect>` 和 `<text>` 可被屏幕阅读器识别
- 可复制文本：用户可直接选中 span 名称/耗时进行复制
- DOM 数量可控：单次最多 50 个 spans，SVG 性能足够
- Canvas 需要自己实现 hit detection（判断鼠标点在哪个 span 上），SVG 原生支持事件
- 调试友好：浏览器 DevTools 可直接检查 SVG 元素

### D4: 为什么 Drizzle 不 Prisma？

**决策**：使用 Drizzle ORM

**理由**：
- Drizzle 更轻量，冷启动时间更短（对 Edge Runtime 友好）
- Drizzle 的 API 更接近 SQL，自定义查询更灵活（cursor 分页需要手动拼接）
- Prisma 在 Edge 环境下有已知的兼容性问题（需要 prisma/adapter-edge）
- Drizzle 对 SQLite/Turso 的支持更成熟（`drizzle-orm/sqlite-core`）
- Turso 官方推荐 Drizzle 作为 ORM（文档中有完整示例）

### D5: 为什么写入走 `ctx.waitUntil`？

**决策**：Playground API Route 在流式响应返回后，通过 `EdgeContext.waitUntil()` 异步写入

**理由**：
- Edge Runtime 不支持同步写操作（数据库连接可能超时）
- `waitUntil` 确保写入在响应返回后继续执行，不阻塞 AI 响应
- 如果写入失败，不影响用户体验（用户已收到 AI 响应）
- 未来可加重试机制或写入队列（但目前够用）

### D6: 为什么不存历史？

**决策**：与 spec Out of Scope 一致，但本期 **就是** 做历史——RunHistory 本身就是历史记录。这里指不存额外历史：
- 不存 prompt 的完整版本（只存 8000 字符，够用）
- 不存用户级别的聚合统计（v2 跨 Run 分析）
- 不做软删除/回收站

---

## 6. 风险预估

### R1: 数据量大时首屏慢

**风险**：runs 表数据量增长后，Server Component 的首次查询变慢。

**应对方案**：
- 列表默认加载 20 条（不是 50 条），减少首屏查询量
- 下滑到阈值再加载剩余 30 条（分两批）
- 已有复合索引 `idx_runs_created_at` 保证 `WHERE created_at < ? ORDER BY created_at DESC` 走索引
- 如果实测 >500ms，考虑 Turso 的 read replica 或 CDN 缓存

### R2: Trace 嵌套太深导致瀑布图超宽

**风险**：span 嵌套超过 5 层，缩进后左侧空间耗尽，右侧渲染区域不足。

**应对方案**：
- 数据库层面：`depth CHECK (depth <= 4)` 约束
- 前端层面：渲染到 depth 4 时，在最后一行底部显示"..."标注"已截断"
- 警告文案："嵌套深度已达上限，可能存在设计问题"

### R3: 跨时区时间显示

**风险**：数据库存 Unix ms 时间戳，但用户可能在不同时区，瀑布图时间刻度需要本地化。

**应对方案**：
- 数据库统一存 Unix ms（无时区问题）
- 前端用 `Intl.DateTimeFormat` + 浏览器时区自动转换
- 时间刻度线显示相对时间（如 "+0ms", "+500ms"）而非绝对时间，避免时区歧义
- 右上角显示 "运行时间: 2026-04-26 14:30:25 (本地时区)"

### R4: Edge Runtime 写入失败

**风险**：`ctx.waitUntil` 中的数据库写入可能失败（网络、连接池耗尽），但用户已收到响应。

**应对方案**：
- `waitUntil` 中的 catch 不抛出错误，只 `console.error` 记录
- 未来可加重试队列（如通过 Webhook 或消息队列）
- 当前阶段接受偶尔丢失记录（测试阶段可接受）

### R5: SVG 性能问题

**风险**：如果单次 Run 有 50+ spans，SVG 元素数量可能影响渲染性能。

**应对方案**：
- 单次最多 50 条 spans（受 NFR-7 嵌套深度限制）
- 每个 span 一行，50 行 SVG 对现代浏览器毫无压力
- 如果实测有性能问题，考虑虚拟滚动（但当前不需要）

---

## 7. 与 Playground 的集成点

### Playground API Route 修改

```typescript
// app/api/playground/stream/route.ts

import { waitUntil } from 'next/server'
import { writeRunRecord } from '@/lib/run-history/writer'

export async function POST(req: Request, ctx: { waitUntil: (p: Promise<void>) => void }) {
  // ... 现有 streamObject 逻辑 ...

  const startTime = Date.now()
  const result = await streamObject({ ... })

  // 异步写入，不阻塞响应
  waitUntil(
    writeRunRecord({
      runId: crypto.randomUUID(),
      prompt,
      modelId: modelConfig.id,
      result,
      startTime,
    })
  )

  return result.toTextStreamResponse()
}
```

### Writer 函数

```typescript
// lib/run-history/writer.ts

export async function writeRunRecord(params: {
  runId: string
  prompt: string
  modelId: string
  result: StreamObjectResult
  startTime: number
}) {
  const endTime = Date.now()
  const latencyMs = endTime - params.startTime

  // 插入 runs
  await db.insert(runs).values({
    id: params.runId,
    prompt: params.prompt.slice(0, 8000),
    modelId: params.modelId,
    status: 'success',
    totalTokens: result.usage?.totalTokens ?? 0,
    latencyMs,
    createdAt: endTime,
  })

  // 插入根 span (LLM 调用)
  await db.insert(spans).values({
    id: crypto.randomUUID(),
    runId: params.runId,
    parentSpanId: null,
    type: 'llm',
    name: params.modelId,
    input: { prompt: params.prompt },
    output: params.result.object?.finalAnswer ?? null,
    error: null,
    startTime: params.startTime,
    endTime,
    duration: latencyMs,
    tokensUsed: result.usage?.totalTokens ?? 0,
    depth: 0,
  })

  // 插入子 spans (tool calls)
  for (const toolCall of params.result.object?.toolCalls ?? []) {
    await db.insert(spans).values({
      id: toolCall.id,
      runId: params.runId,
      parentSpanId: 根 span id,
      type: 'tool',
      name: toolCall.name,
      input: toolCall.input,
      output: toolCall.output,
      error: null,
      startTime: params.startTime, // 简化：工具调用时间用 LLM 调用的时间
      endTime,
      duration: toolCall.duration,
      tokensUsed: 0, // streamObject 不提供工具级别的 token 统计
      depth: 1,
    })
  }
}
```
