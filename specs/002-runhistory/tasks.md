# RunHistory 页 - 任务清单

**Feature**: RunHistory 页 — 调用历史 + Trace 瀑布图
**Spec**: [specs/002-runhistory/spec.md](spec.md)
**Plan**: [specs/002-runhistory/plan.md](plan.md)
**Created**: 2026-04-26

---

## 已完成任务（Step 2.2 Schema Design 已生成，无需执行）

- [x] T000 [P] 创建 shared/schemas/run-history.ts — Zod schema 定义（Run, FlatSpan, SpanNode 递归, RunQuery, PaginatedRuns, RunDetail）
- [x] T001 [P] 创建 db/schema.ts — Drizzle 表定义（runs + spans，自关联，索引）
- [x] T002 [P] 创建 lib/run-history/span-tree.ts — 扁平 spans → 树重建 + 时间范围计算 + 耗时色阶映射

---

## Phase 1: 基础设施（P0 阻塞项）

**目标**：安装数据库依赖、配置连接、创建 db client

- [x] T010 [P] 安装 Drizzle + Turso 依赖 — `pnpm add drizzle-orm @libsql/client` + `pnpm add -D drizzle-kit` (5 min)
- [x] T011 创建 db/index.ts — Drizzle client 初始化，读取 `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` 环境变量 (10 min)
  - 依赖: T010
- [x] T012 创建 drizzle.config.ts — drizzle-kit 配置（dialect: sqlite, schema: db/schema.ts, out: drizzle/） (5 min)
  - 依赖: T010
- [x] T013 在 .env.example 中补充 TURSO_DATABASE_URL + TURSO_AUTH_TOKEN 模板 (5 min)
- [x] T014 运行 `drizzle-kit push` 验证表结构可正确创建 (10 min)
  - 依赖: T011, T012

**依赖**：T010 → T011, T012 → T014；T013 独立
**测试标准**：`drizzle-kit push` 成功，Turso 数据库中可见 runs + spans 表

---

## Phase 2: 数据层（P0 阻塞项）

**目标**：完成 repository（读）和 writer（写），使 API Route 和 Server Component 可调用

- [x] T020 创建 lib/run-history/repository.ts — 数据库查询层：
  - `getRunsList(query)`：cursor-based 分页 + 筛选（status / modelId / timeRange），返回 `PaginatedRuns`
  - `getRunDetail(runId)`：查询单条 Run + 关联 spans（扁平列表），返回 `RunDetail`（不含树重建）
  - `getDistinctModels()`：查询已使用过的模型列表（用于筛选下拉） (30 min)
  - 依赖: T001, T011
- [x] T021 创建 lib/run-history/writer.ts — 写操作：
  - `writeRunRecord(params)`：插入 runs 记录 + 根 span (LLM) + 子 spans (toolCalls)
  - 包含错误捕获（不抛出，只 console.error）
  - 使用 `crypto.randomUUID()` 生成 ID
  - depth 约束 ≤ 4 (30 min)
  - 依赖: T001, T011

**依赖**：T020 → T011, T001；T021 → T011, T001（T020 和 T021 可并行）
**测试标准**：可用 `node --experimental-strip-types` 或手写脚本验证插入和查询

---

## Phase 3: 写入集成（P0）

**目标**：将 writer 接入 Playground API Route，使每次调用自动产生 Run + Span 记录

- [x] T030 修改 app/api/playground/stream/route.ts — 在 streamObject 成功后，通过 `waitUntil` 异步调用 `writeRunRecord`：
  - 导入 `waitUntil` from `next/server`
  - 捕获 startTime / endTime / latencyMs
  - 从 result.object 提取 toolCalls 作为子 spans
  - 写入失败不阻塞 AI 响应 (20 min)
  - 依赖: T021

**依赖**：T030 → T021
**测试标准**：在 Playground 发送 prompt 后，数据库中出现 runs + spans 记录

---

## Phase 4: [US1] Run 列表 + 筛选（P0 核心）

**目标**：完成 RunHistory 页面的左栏：Run 列表 + 筛选面板 + cursor 分页

**用户故事**：作为 AgentHub 用户，我希望能看到最近的 AI 调用列表并筛选，以便快速定位需要排查的调用。

**独立测试标准**：
- 页面 `/runs` 可访问，左栏显示 Run 列表（时间倒序）
- 筛选条件变化时列表正确刷新
- 滚动到底部可加载更多（cursor 分页）
- 无数据时显示空状态

- [x] T040 [P] [US1] 创建 components/run-history/empty-state.tsx — 空状态组件：
  - 左栏空状态："尚未有任何调用记录，去 Playground 试试吧" + Playground 跳转链接
  - 右栏空状态："选择一条 Run 查看详情"
  - 使用 @theme tokens，不硬编码颜色 (15 min)
- [x] T041 [P] [US1] 创建 components/run-history/run-item.tsx — 单条 Run 行组件：
  - 接收 `Run` props，显示：状态 icon（✓ 绿/✗ 红）/ prompt 摘要（前 80 字符）/ 耗时 / token 总数
  - 支持 `selected` 和 `onClick` props
  - 使用 @theme tokens (20 min)
- [x] T042 [P] [US1] 创建 components/run-history/filter-panel.tsx — 筛选面板：
  - 状态筛选：Select（all / success / error）
  - 模型筛选：Select（从 `getDistinctModels()` 获取选项）
  - 时间范围：Select（1h / 24h / 7d / custom）
  - "重置"按钮
  - props: `filters`, `onFilterChange`, `models` (25 min)
- [x] T043 [US1] 创建 components/run-history/run-list.tsx — 左栏 Run 列表（Client Component）：
  - 接收初始 runs 数据（Server Component props 注入）
  - 滚动到底部或点击"加载更多" → fetch `/api/runs?cursor=xxx` → 追加数据
  - 接收并透传 filter-panel 的筛选条件
  - 管理状态：`runs[]`, `cursor`, `hasMore`, `loading`, `selectedRunId`, `onSelectRun` (30 min)
  - 依赖: T040, T041, T042
- [x] T044 [US1] 创建 app/api/runs/route.ts — 列表 API Route：
  - 接收查询参数：`cursor`, `limit`, `status`, `modelId`, `timeRange`
  - 调用 `repository.getRunsList(query)`
  - 返回 `PaginatedRuns` JSON
  - 错误处理：参数校验失败返回 400 (20 min)
  - 依赖: T020
- [x] T045 [US1] 创建 app/runs/page.tsx — RunHistory 主页面（Server Component）：
  - 首次渲染：直接调用 `repository.getRunsList()` 获取初始数据
  - 布局：左栏（320px 固定宽度）= filter-panel + run-list；右栏（flex-1）= trace-viewer 或 empty-state
  - 响应式：1024px+ 双栏；<1024px 仅显示左栏（右栏隐藏） (25 min)
  - 依赖: T043, T044, T040

**依赖**：T040-T042 互相独立可并行 → T043 → T045；T044 → T043（数据源）
**测试标准**：左栏可显示 Run 列表、筛选、分页；点击某行在右侧占位区显示"选择了一条 Run"

---

## Phase 5: [US1] Trace 瀑布图（P0 核心）

**目标**：完成右栏 Trace 瀑布图：SVG 渲染 + Span 展开 + 时间刻度

- [x] T050 [P] [US1] 创建 components/run-history/time-axis.tsx — 瀑布图时间刻度线（SVG）：
  - 接收 `totalMs` + `width` props
  - 生成均匀分布的时间刻度（每 4px 阶梯对应一个时间间隔）
  - 显示相对时间标签（"+0ms", "+500ms", "+1s"） (15 min)
- [x] T051 [P] [US1] 创建 components/run-history/span-detail.tsx — Span 展开详情：
  - 接收 `SpanNode` props
  - 展开显示：input（格式化 JSON）、output（文本）、error（红色高亮，如有）
  - 展开/收起切换（useState） (20 min)
- [x] T052 [US1] 创建 components/run-history/span-row.tsx — 瀑布图单行（SVG span 条）：
  - 接收 `SpanNode` + `TraceLayout` + `onSelect` props
  - 渲染 `<g>` 元素：缩进（depth × 24px）+ `<rect>`（时间→x 坐标映射）+ 名称文本 + 耗时文本
  - 点击展开 span-detail
  - 虚线连接子 span（如果有）
  - 使用 @theme tokens 着色（按 type: llm/tool/system + 耗时色阶） (30 min)
  - 依赖: T050, T051
- [x] T053 [US1] 创建 components/run-history/trace-viewer.tsx — 右栏 Trace 瀑布图（Client Component）：
  - 接收 `runId` props
  - 点击时 fetch `/api/runs/[id]` 获取 RunDetail
  - `buildSpanTree(flatSpans)` 重建嵌套树
  - `getTraceTimeRange()` 计算总时间范围
  - 渲染 SVG：时间刻度线 + span-row 列表
  - 加载态：骨架屏；错误态：error-display 复用
  - 深度截断：超过 5 层显示"..."标注 (40 min)
  - 依赖: T052, T002
- [x] T054 [US1] 创建 app/api/runs/[id]/route.ts — 详情 API Route：
  - 接收 `id` 参数
  - 调用 `repository.getRunDetail(id)`
  - 返回 `RunDetail` JSON（含 spans 扁平列表）
  - 404 处理：Run 不存在时返回 404 (15 min)
  - 依赖: T020

**依赖**：T050, T051 可并行 → T052 → T053；T054 → T053（数据源）
**测试标准**：点击左栏 Run 后右栏显示瀑布图，span 可展开/收起，时间刻度正确

---

## Phase 6: Header 导航接入（P1）

**目标**：让 RunHistory 可从导航栏访问

- [ ] T060 修改 components/layout/header.tsx — 在 navItems 数组中新增 RunHistory 入口：`{ label: '运行记录', href: '/runs' }`（如已有则跳过） (5 min)

**测试标准**：Header 中可见 "运行记录" 链接，点击跳转 `/runs`，当前页高亮正确

---

## Phase 7: 响应式与体验优化（P2）

**目标**：确保 1024px+ 双栏体验，优化细节

- [ ] T070 检查 app/runs/page.tsx 在 1024px / 1280px / 768px 断点下的布局 —— 确保双栏/单栏切换正确，不溢出 (20 min)
- [ ] T071 优化 span-row 的 hover 效果 —— hover 时高亮当前 span 条，增强可读性 (15 min)
- [ ] T072 优化空状态文案和视觉 —— 确保 Playground 跳转链接可点击且有 hover 态 (10 min)

**测试标准**：浏览器窗口从 1280px 缩放到 768px，所有元素正常显示无溢出

---

## 依赖图

```
T010 ──┐
       ├── T011 ──┬── T020 ──┬── T044 ──┐
       │          │          │           │
T012 ──┘          │          │           ├── T045
                  │          │           │
T013 ──┐          │          │           │
       │          │          │           │
       ├── T014 ──┘          │           │
                            ├── T021 ── T030
                            │
                            ├── T040 ──┐
                            │          │
                            ├── T041 ──┤
                            │          ├── T043 ──┘
                            └── T042 ──┘

T050 ──┐
       │           ┌── T052 ── T053
T051 ──┤           │           ↑
       └───────────┤           │
                   └── T054 ───┘
                   └── T002 ───┘

T060 （独立，可在任何阶段执行）

T070 ──┐
T071 ──┤ （Phase 7 依赖 Phase 4 + 5 完成）
T072 ──┘
```

**并行机会**：
- Phase 1：T010-T013 可并行（除 T014 等 T011+T012）
- Phase 2：T020 和 T021 可并行
- Phase 4：T040-T042 完全独立可并行
- Phase 5：T050 和 T051 完全独立可并行

## 实现策略

1. **MVP 范围**：Phase 1 + 2 + 3 + 4 + 5 → 即可获得一个可运行的 RunHistory（T010-T054）
2. **增量验证**：
   - 完成 Phase 1+2 → 可用脚本验证数据库读写
   - 完成 Phase 3 → 在 Playground 发一次请求，验证数据库有记录
   - 完成 Phase 4 → 访问 `/runs` 可看到列表
   - 完成 Phase 5 → 点击列表项可看到瀑布图
3. **风险优先级**：先做 Phase 1+2（数据库基础设施），因为所有后续任务依赖此层
