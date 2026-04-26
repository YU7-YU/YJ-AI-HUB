# Playground 页 - 技术规划

## 1. 文件结构

### 新增文件

| 文件路径 | 职责 |
|----------|------|
| `app/playground/page.tsx` | Playground 主页面（客户端组件），包含模型选择器、输入区、响应区 |
| `app/api/playground/stream/route.ts` | 流式 API Route（Edge Runtime），接收 prompt + model，转发给 AI provider |
| `shared/schemas/playground-response.ts` | Zod schema 定义，前后端共用（AIResponse、ThinkingStep、ToolCall、ResponseMetadata） |
| `components/playground/model-selector.tsx` | 模型选择器组件（下拉菜单，支持 5 家模型） |
| `components/playground/prompt-input.tsx` | Prompt 输入组件（多行文本框 + 字符计数 + 发送/清空按钮） |
| `components/playground/thinking-card.tsx` | 思考过程时间线卡片（骨架屏 → 填充） |
| `components/playground/tool-call-card.tsx` | 工具调用表格卡片（骨架屏 → 填充） |
| `components/playground/answer-card.tsx` | 最终答案 markdown 卡片（骨架屏 → 填充） |
| `components/playground/error-display.tsx` | 分类错误展示组件（鉴权/限流/超长/网络） |
| `components/playground/response-area.tsx` | 响应区容器组件（聚合 3 张卡片 + 复制 JSON 按钮） |
| `lib/playground/models.ts` | 模型配置常量（5 家模型的 id/name/provider 映射） |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `components/layout/header.tsx` | 导航栏新增 "Playground" 链接 |
| `lib/mock-data.ts` | 不修改（Playground 不使用 mock 数据） |

---

## 2. 数据流

完整数据流：用户输入 → AI 响应渲染

```
用户输入阶段:
  prompt-input.tsx (useState 管理输入文本)
    ↓ Cmd/Ctrl+Enter 或点击"发送"
  字符计数校验（≤ 8000 才允许提交）
    ↓
  设置 isLoading = true（按钮 disabled + loading 态，模型选择器 disabled）
    ↓

API 调用阶段:
  useObject hook (Vercel AI SDK v5)
    ↓ 发起 POST 请求
  /app/api/playground/stream/route.ts (Edge Runtime)
    ↓ 读取环境变量 API Key
    ↓ 根据 model 参数路由到对应 provider
    ↓ 调用 Vercel AI SDK 的 streamObject()
    ↓ 传入 Zod schema 定义期望的结构化输出
    ↓
  AI Provider API (OpenAI / Anthropic / DeepSeek)
    ↓ 流式返回结构化 JSON
    ↓
  streamObject 将 partialObject 逐步推回客户端

UI 渲染阶段:
  useObject 的 partialObject 增量更新 React state
    ↓ 每到一个字段触发一次 re-render
    ↓
  response-area.tsx 根据 partialObject 决定展示哪些卡片:
    ├── partialObject.thinkingProcess 有数据 → 渲染 thinking-card.tsx
    │       内部字段未到时 → 骨架屏
    │       字段到达 → 逐步填充 ThinkingStep 时间线
    ├── partialObject.toolCalls 有数据 → 渲染 tool-call-card.tsx
    │       内部字段未到时 → 骨架屏
    │       字段到达 → 逐步填充 ToolCall 表格
    └── partialObject.finalAnswer 有数据 → 渲染 answer-card.tsx
            文本未到时 → 骨架屏
            文本到达 → 逐步填充 markdown

完成/错误阶段:
  成功: useObject 的 isLoading 变为 false → 按钮恢复可用 → 显示"复制 JSON"按钮
  失败: useObject 的 onError 回调 → error-display.tsx 根据错误类型分类展示
```

**技术标注**：
- 客户端状态管理：`useState`（输入文本、loading 态、错误态）
- 流式数据获取：Vercel AI SDK v5 `useObject` hook
- 流式传输协议：`streamObject`（服务端）+ `partialObject`（客户端增量更新）
- Schema 校验：Zod（前后端共用同一 schema 文件）
- 错误分类：API Route 返回结构化错误对象，前端根据 `error.type` 分类展示

---

## 3. Schema 设计

**文件位置**：`shared/schemas/playground-response.ts`

### 顶层结构：AIResponse

```
z.object({
  thinkingProcess: z.array(ThinkingStep),    // 思考过程数组
  toolCalls:       z.array(ToolCall),        // 工具调用数组
  finalAnswer:     z.string(),               // 最终答案 markdown
  metadata:        z.object(ResponseMetadata), // 元信息
})
```

### 嵌套结构

**ThinkingStep**（思考步骤）：
```
z.object({
  id:        z.string(),              // 唯一 ID
  content:   z.string(),              // 思考内容
  timestamp: z.number(),              // 时间戳（Unix ms）
})
```

**ToolCall**（工具调用）：
```
z.object({
  id:       z.string(),                          // 唯一 ID
  name:     z.string(),                          // 工具名称
  input:    z.record(z.string(), z.unknown()),   // 工具输入参数
  output:   z.string(),                          // 工具输出结果
  duration: z.number(),                          // 耗时（ms）
})
```

**ResponseMetadata**（元信息）：
```
z.object({
  modelUsed:   z.string(),        // 实际使用的模型 ID
  totalTokens: z.number(),        // 总 token 消耗
  latencyMs:   z.number(),        // 端到端延迟
  finishedAt:  z.number(),        // 完成时间戳
})
```

### 字段设计要点

| 维度 | 设计 | 理由 |
|------|------|------|
| **Optional 字段** | 顶层所有字段在流式过程中均为 partial（useObject 内部处理），无需在 Zod 层标记 `.optional()`。streamObject 会逐步填充 schema 结构。 | Vercel AI SDK 的 `partialObject` 在字段到达前为 `undefined`，这是 hook 层的行为，不是 schema 层面的 optional。 |
| **Enum 使用** | `ToolCall.name` 可以加 enum 限制（如 `"web_search"`, `"code_execute"`, `"file_read"`），但第一期先保持 `z.string()` 以支持更多工具类型。 | 工具类型可能随时扩展，第一期保持灵活性。v2 可收紧为 enum。 |
| **数组约束** | `thinkingProcess`: `min(0)`（模型可能不返回思考过程）<br>`toolCalls`: `min(0)`（可能不调用工具）<br>`finalAnswer`: 不允许空数组，但允许空字符串 | 思考过程和工具调用是可选环节，最终答案必须有（即使为空）。 |
| **字符串约束** | `finalAnswer`: `z.string().max(10000)` 防超长；`content`: `z.string().max(2000)` 每步思考内容上限 | 防止模型输出不可控长度导致 OOM。 |
| **数字约束** | `duration`: `z.number().min(0)` 耗时不能为负<br>`totalTokens`: `z.number().min(0)` | 合理下限约束。 |

---

## 4. API 边界

### POST /api/playground/stream

**Edge Runtime**：`export const runtime = 'edge'`

**请求体**（JSON）：
```typescript
{
  model: string,    // 模型 ID（如 "claude-4.7", "gpt-5.3"）
  prompt: string,   // 用户 prompt（≤ 8000 字符）
}
```

**响应**：
- 成功：`Content-Type: text/plain`（SSE 流），Vercel AI SDK 的 `streamObject` 自动序列化
- 错误：`Content-Type: application/json`，结构化错误体：

```typescript
{
  type:    "auth" | "rate_limit" | "context_length" | "network" | "unknown",
  message: string,     // 用户友好的错误信息
  detail?: string,     // 技术细节（可选，用于 retry-after 秒数等）
}
```

**错误码映射**：

| HTTP 状态 | type | message | detail |
|-----------|------|---------|--------|
| 401/403 | `auth` | "API Key 无效或已过期" | - |
| 429 | `rate_limit` | "请求过于频繁" | Retry-After 秒数 |
| 400/413 | `context_length` | "输入超出模型上下文限制" | - |
| 500/timeout | `network` | "连接失败" | 原始错误信息 |

**Provider 路由逻辑**：
```
model 参数 → 查 models.ts 映射 → 确定 provider → 创建对应 AI SDK provider 实例
  ├── "gpt-5.3"      → createOpenAI({ apiKey: OPENAI_API_KEY })
  ├── "claude-4.7"   → createAnthropic({ apiKey: ANTHROPIC_API_KEY })
  ├── "gemini-3.1-flash" → createGoogle({ apiKey: GOOGLE_API_KEY })
  ├── "deepseek-v3.2"    → createOpenAI({ apiKey: DEEPSEEK_API_KEY, baseURL: DEEPSEEK_BASE_URL })
  └── "qwen-3.5-flash"   → createOpenAI({ apiKey: DASHSCOPE_API_KEY, baseURL: DASHSCOPE_BASE_URL })
```

> 注意：DeepSeek 和 Qwen 使用 OpenAI 兼容 API（custom baseURL），无需单独 SDK。

---

## 5. 技术决策

### D1: 为什么选 streamObject 不选 streamText？

**决策**：使用 `streamObject`

**理由**：
- Spec 要求 AI 响应是**结构化**的（思考过程 / 工具调用 / 最终答案），不是纯文本
- `streamObject` 返回强类型的 `partialObject`，前端可以直接按字段访问 `partialObject.thinkingProcess`，无需自己解析 JSON
- `streamText` 返回的是纯文本流，需要额外做结构化解析，容易出错且无法利用 Zod 校验
- `streamObject` 天然支持增量更新（partialObject 每次只变化到达的字段），符合 FR-4 的需求

### D2: 为什么用 Edge Runtime？

**决策**：API Route 使用 `runtime = 'edge'`

**理由**：
- Playground 是流式场景，Edge Runtime 冷启动更快（~50ms vs ~500ms），直接影响 NFR-1（首个 token < 2s）
- Edge 环境更接近用户物理位置，减少网络延迟
- Vercel AI SDK v5 完全兼容 Edge Runtime
- 代价：无法使用 Node.js 原生模块（如 fs、crypto），但本项目不需要
- 环境变量在 Edge 下通过 `process.env` 访问（Vercel 平台支持）

### D3: 为什么 schema 放 shared/schemas/？

**决策**：Zod schema 放在 `shared/schemas/playground-response.ts`

**理由**：
- 前端（useObject）和后端（API Route 的 streamObject）需要引用**同一个** schema，确保类型一致
- 放在 `shared/` 而非 `app/` 或 `components/` 下，明确表达"前后端共用"的意图
- 未来如果有其他 feature 需要类似的流式响应（如 RunHistory 的 trace 分析），可复用此模式
- Zod schema 编译为 TypeScript 类型后，前后端都能获得完整的类型推导

### D4: 为什么用 useObject hook 不用 useSWR？

**决策**：使用 Vercel AI SDK 的 `useObject`

**理由**：
- `useSWR` 是为 RESTful 数据获取设计的，不支持 SSE 流式传输
- `useObject` 是专为 streamObject 设计的 React hook，内置 partialObject 增量更新、loading 态、error 处理
- `useObject` 自动管理 AbortController，请求中断时自动清理
- `useSWR` 需要自己实现 SSE 解析和增量更新逻辑，工作量大且容易出错
- `useObject` 返回的 `isLoading`、`error`、`stop()` 直接对应 FR-7 和 FR-6 的需求

### D5: 为什么不存历史？

**决策**：与 spec Out of Scope 一致，不做持久化

**理由**：
- 第一期聚焦核心的"流式结构化响应"体验，持久化会增加复杂度（状态管理、存储方案、数据清理）
- Playground 是"即试即走"的工具场景，用户期望的是快速测试，不是历史记录管理
- 历史对话功能留给 RunHistory spec（已在 Out of Scope 中明确）
- 零持久化意味着零数据隐私风险，无需考虑 GDPR/数据合规问题

---

## 6. 风险预估

### R1: Vercel AI SDK v5 对部分 provider 的 Edge 兼容性

**风险**：`createAnthropic`、`createGoogle` 在 Edge Runtime 下可能有不兼容的底层依赖（如 `crypto` 模块）。

**应对方案**：
- 第一期仅验证 OpenAI（最稳定）+ Anthropic（次稳定）两个 provider
- DeepSeek/Qwen 通过 OpenAI 兼容 API 接入，走 `createOpenAI` 路径
- Gemini 如果 Edge 下不稳定，降级为 fetch 方式，保持 API Route 返回格式不变
- 在 `models.ts` 中用 `supportedRuntime` 标记每个 provider 的运行时兼容性

### R2: streamObject 的 partialObject 更新频率过高导致 React 性能问题

**风险**：`partialObject` 每次字段到达都触发 re-render，如果 AI 响应很快（如 100 次/秒），React 可能跟不上。

**应对方案**：
- 使用 React 19 的并发渲染（默认开启），自动批处理更新
- 三张卡片组件各自独立渲染，不会互相阻塞
- 如果实测有性能问题，在 `useObject` 外部加 `useTransition` 降低渲染优先级
- 骨架屏只在字段首次到达时出现，后续增量更新直接渲染内容，不会反复闪动

### R3: 流式过程中的 AbortController 管理

**风险**：用户切页面或组件 unmount 时，如果没有正确 Abort，会浪费 API 调用和产生不可控费用。

**应对方案**：
- `useObject` 内置 AbortController 管理，组件 unmount 时自动中断
- 但 spec 要求"响应中禁用模型切换"（D5），所以不会有中途切模型的场景
- 如果未来允许中途取消，在 prompt-input 组件加"取消"按钮，调用 `useObject` 返回的 `stop()` 方法

### R4: Edge Runtime 环境变量在不同部署环境下的可用性

**风险**：Vercel 平台在 Edge 下暴露环境变量的方式与 Node.js 不同，本地开发时可能拿不到 Key。

**应对方案**：
- 本地开发使用 `.env.local`，Vercel AI SDK 的 `createOpenAI` 等默认从 `process.env` 读取，本地和线上行为一致
- 在 `route.ts` 开头做 env 校验，Key 不存在时返回 `auth` 错误而非 500
- 文档中注明本地开发需要配置 `.env.local`

### R5: 结构化输出的 schema 与模型实际输出不匹配

**风险**：不同 provider 对 structured output 的支持程度不同，有些模型可能无法严格按照 Zod schema 输出，导致 parse 失败。

**应对方案**：
- 在 API Route 的 `streamObject` 调用中设置 `onError` 回调，捕获 schema 校验失败
- Zod schema 尽量宽松：用 `z.string()` 而非复杂嵌套，减少模型输出格式不匹配的概率
- `toolCalls.input` 用 `z.record(z.string(), z.unknown())` 而非具体字段，适应不同工具的输入格式
- 如果某模型持续输出不匹配，在 `models.ts` 中标记为 `structuredOutput: false`，降级用 `streamText` + JSON parse
