# RunHistory 页 - Spec v1.0

## 1. 概述

### 1.1 背景
AgentHub 用户通过 Playground 发起 AI 调用后，需要一个可追溯的历史记录页面来排查问题——包括定位慢调用、失败的子调用、Token 消耗异常等场景。

### 1.2 目标
构建一个 RunHistory 页面，支持：
- 左栏：Run 列表（时间倒序、cursor-based 分页、状态筛选）
- 右栏：选中 Run 后展示完整 Trace 瀑布图（嵌套 span、时间轴、色阶区分）
- Span 可展开查看 input/output/error 详情
- 支持按状态 / 模型 / 时间范围筛选

### 1.3 范围
**本期包含**：
- Run 列表（左栏）：分页、筛选、状态 icon、摘要信息
- Trace 瀑布图（右栏）：SVG 渲染、嵌套 span 缩进、时间刻度线
- Span 展开详情：input/output/error
- 数据持久化：Drizzle + Turso，Playground 调用自动写入 Run + Span
- Cursor-based 分页（单次最多 50 条）
- 筛选器：状态（success/error）、模型、时间范围

**本期不包含**（v2+）：
- Trace 时间线重放（Langfuse 级别复杂度）
- 跨 Run 聚合分析
- 告警推送

---

## 2. 用户故事

> 作为 AgentHub 用户，我希望有一个 RunHistory 页面，
> 能看到最近的 AI 调用列表和每条记录的完整 Trace 瀑布图，
> 帮助我排查"某次调用为什么慢"或"某个工具调用失败了"。

---

## 3. 用户场景与测试

### 场景 1：浏览 Run 列表
1. 用户进入 RunHistory 页面
2. 左栏显示最近 Run 列表（时间倒序）
3. 每行显示：状态 icon（✓ 绿 / ✗ 红）、prompt 摘要、耗时、token 总数
4. 用户滚动到底部自动加载下一页（或点击"加载更多"）
5. 列表以 cursor-based 方式分页，单次最多 50 条

**验证点**：
- 列表按时间倒序排列
- 分页无重复数据
- 状态 icon 与实际状态一致

### 场景 2：查看 Trace 瀑布图
1. 用户点击左栏某条 Run
2. 右栏加载并展示该 Run 的完整 Trace 瀑布图
3. 瀑布图横轴为时间轴，每个 span 占据一个水平条
4. 不同 span 类型用颜色区分：LLM 调用（蓝）、工具调用（紫）、错误调用（红）
5. 时间刻度线清晰可见（4px 阶梯）

**验证点**：
- 瀑布图加载后每个 span 位置准确
- 颜色与 span 类型对应正确
- 时间刻度线间距均匀

### 场景 3：展开 Span 详情
1. 用户点击瀑布图中某个 span
2. Span 展开显示：input 参数、output 结果、error 信息（如有）
3. 嵌套 span 缩进显示，连接线用虚线

**验证点**：
- 展开/收起交互流畅
- 嵌套层级关系清晰（最多 5 层）
- 虚线连接线可见且对齐

### 场景 4：筛选 Run 列表
1. 用户在筛选面板中选择：
   - 状态筛选：all / success / error
   - 模型筛选：指定模型（如 GPT-5.3、Claude 4.7）
   - 时间范围：最近 1 小时 / 最近 24 小时 / 最近 7 天 / 自定义
2. 列表根据筛选条件刷新

**验证点**：
- 筛选条件组合生效
- 无结果时展示空状态
- 筛选条件可一键重置

### 场景 5：排查慢调用
1. 用户通过耗时色阶快速定位慢调用：
   - <200ms：绿色
   - 200-1000ms：黄色
   - >1000ms：红色
2. 点击慢调用的 span 查看具体瓶颈

**验证点**：
- 色阶颜色与实际耗时一致
- 能快速识别出哪个 span 是瓶颈

### 场景 6：空状态与首次使用
1. 用户首次访问 RunHistory，无任何调用记录
2. 页面展示空状态引导："尚未有任何调用记录，去 Playground 试试吧"
3. 空状态包含跳转到 Playground 的链接

---

## 4. 功能需求

### FR-1: Run 列表（左栏）

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | 左侧面板显示 Run 列表，时间倒序排列，每行包含状态 icon / prompt 摘要 / 耗时 / token 总数 |
| 验收标准 | 列表支持 cursor-based 分页（单次 ≤50 条）；状态 icon 区分 success（绿✓）/ error（红✗）；点击某行在右侧展示对应 Trace；列表宽度可自适应 |

### FR-2: Trace 瀑布图（右栏）

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | 右侧面板展示选中 Run 的完整 Trace 瀑布图，SVG 渲染，横轴为时间轴 |
| 验收标准 | 每个 span 一行，水平条长度代表耗时；不同 span 类型用不同颜色：LLM 调用（蓝）、工具调用（紫）、错误（红）；时间刻度线 4px 阶梯间距；支持嵌套 span 缩进（最多 5 层），虚线连接子 span |

### FR-3: Span 展开详情

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | 点击 span 可展开查看 input / output / error 详情 |
| 验收标准 | 展开/收起交互正常；input 以格式化 JSON 展示；output 以文本/JSON 展示；error 存在时高亮红色展示 |

### FR-4: 筛选面板

| 字段 | 描述 |
|------|------|
| 优先级 | P1 |
| 描述 | 支持按状态 / 模型 / 时间范围筛选 Run 列表 |
| 验收标准 | 状态筛选：all / success / error；模型筛选：下拉选择已使用过的模型；时间范围：预设选项 + 自定义日期；筛选条件组合生效；支持一键重置 |

### FR-5: Cursor-based 分页

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | Run 列表使用 cursor-based 分页，单次最多加载 50 条 |
| 验收标准 | "加载更多"按钮或滚动触发下一页；无重复数据；最后一页时隐藏"加载更多" |

### FR-6: 耗时色阶

| 字段 | 描述 |
|------|------|
| 优先级 | P1 |
| 描述 | 瀑布图中 span 颜色按耗时着色 |
| 验收标准 | <200ms 绿色 / 200-1000ms 黄色 / >1000ms 红色；色阶颜色与实际耗时一致 |

### FR-7: 空状态

| 字段 | 描述 |
|------|------|
| 优先级 | P1 |
| 描述 | 无数据时展示空状态 + 跳转到 Playground 的引导 |
| 验收标准 | 左栏空状态：文案 + Playground 跳转链接；右栏空状态：提示"选择一条 Run 查看详情" |

---

## 5. 非功能需求

### NFR-1: 数据持久化

| 字段 | 描述 |
|------|------|
| 指标 | 使用 Drizzle ORM + Turso（SQLite）持久化每次 Playground 调用的 Run + Span 记录 |
| 验证方式 | 代码审查确认：API Route 在调用 streamObject 后写入数据库；表结构包含 runs 和 spans 两张表 |

### NFR-2: 分页性能

| 字段 | 描述 |
|------|------|
| 指标 | 使用 cursor-based 分页（非 offset），单次最多 50 条 |
| 验证方式 | API 请求参数包含 `cursor` 而非 `offset`；SQL 查询使用 `WHERE id < ? ORDER BY created_at DESC LIMIT 51` |

### NFR-3: Trace 数据结构

| 字段 | 描述 |
|------|------|
| 指标 | Trace schema 支持递归（span 可包含 children span） |
| 验证方式 | spans 表包含 `parent_span_id` 字段，支持自关联查询 |

### NFR-4: 可访问性

| 字段 | 描述 |
|------|------|
| 指标 | 瀑布图使用 SVG 而非 canvas，支持无障碍访问和文本复制 |
| 验证方式 | 代码审查确认瀑布图使用 `<svg>` 元素；span 条可被屏幕阅读器识别 |

### NFR-5: 样式

| 字段 | 描述 |
|------|------|
| 指标 | 所有颜色/间距使用 @theme tokens，禁止硬编码 hex 颜色值 |
| 验证方式 | 代码审查无硬编码 color/hex |

### NFR-6: 响应式

| 字段 | 描述 |
|------|------|
| 指标 | 最小支持 1024px（双栏布局核心场景） |
| 验证方式 | 1024px+ 显示双栏；<1024px 时左栏优先，右栏隐藏或切换至详情页模式 |

### NFR-7: 嵌套深度

| 字段 | 描述 |
|------|------|
| 指标 | Trace 最大嵌套深度限制为 5 层 |
| 验证方式 | 数据库层面通过 CHECK 约束限制 depth ≤ 5；前端超过 5 层时截断显示并标注"已截断" |

---

## 6. 关键实体

### Run（调用记录）

```
Run
├── id: string              // 唯一标识（UUID）
├── prompt: string          // 用户输入的 prompt（前 200 字符摘要）
├── modelId: string         // 使用的模型 ID
├── status: 'success' | 'error'
├── totalTokens: number     // 总 token 消耗
├── latencyMs: number       // 端到端延迟（ms）
├── error: string | null    // 错误信息（如有）
├── createdAt: number       // 创建时间（Unix ms）
└── spans: Span[]           // 关联的 span 列表
```

### Span（调用步骤）

```
Span
├── id: string              // 唯一标识（UUID）
├── runId: string           // 所属 Run 的 ID
├── parentSpanId: string | null  // 父 span ID（null 表示根 span）
├── type: 'llm' | 'tool' | 'system'
├── name: string            // span 名称（模型名 / 工具名）
├── input: object | null    // 输入参数
├── output: string | null   // 输出结果
├── error: string | null    // 错误信息
├── startTime: number       // 开始时间（Unix ms）
├── endTime: number         // 结束时间（Unix ms）
├── duration: number        // 耗时（ms）
├── tokensUsed: number      // token 消耗
├── depth: number           // 嵌套层级（0-4）
└── children: Span[]        // 子 span（自关联）
```

### TraceQuery（查询参数）

```
TraceQuery
├── cursor: string | null   // 分页游标
├── limit: number           // 每页条数（默认 50）
├── status: 'all' | 'success' | 'error'
├── modelId: string | null  // 按模型筛选
├── timeRange: '1h' | '24h' | '7d' | 'custom'
├── customFrom: number | null
└── customTo: number | null
```

---

## 7. 假设

- Drizzle + Turso 已在项目中配置或即将配置
- Turso 提供免费/低成本的开发环境
- Playground API Route 在调用 streamObject 成功后同步写入 Run + Span 记录
- 用户无需登录即可访问 RunHistory（无鉴权拦截）
- Cursor-based 分页使用 `created_at` 降序 + `id` 作为游标
- 时间刻度单位为毫秒，瀑布图总宽度为容器宽度的 100%
- SVG 方案足以渲染最多 50 条 span 的瀑布图（性能可接受）

---

## 8. 依赖

- Next.js 15（已有）
- React 19（已有）
- Drizzle ORM（需安装）
- Turso（`@libsql/client`，需安装 + 配置 `.env.local`）
- shadcn/ui（已有）
- `@theme` tokens（已有，globals.css 已定义）

---

## 9. 待确认事项

> 无 [NEEDS CLARIFICATION] 标记——所有关键决策点已明确。
