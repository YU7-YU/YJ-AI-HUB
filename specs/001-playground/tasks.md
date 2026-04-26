# Playground 页 - 任务清单

**Feature**: Playground 页 — 流式结构化 AI 响应
**Spec**: [specs/001-playground/spec.md](spec.md)
**Plan**: [specs/001-playground/plan.md](plan.md)
**Created**: 2026-04-26

---

## 已完成任务（已生成，无需执行）

- [x] T000 [P] 创建 shared/schemas/playground-response.ts — Zod schema 定义（ThinkingStep, ToolCall, ResponseMetadata, PlaygroundResponse）
- [x] T001 [P] 创建 app/api/playground/stream/route.ts — 流式 API Route（Edge Runtime, streamObject, 错误分类, provider 路由）
- [x] T002 [P] 创建 lib/playground/models.ts — 5 家模型配置常量
- [x] T003 安装 Vercel AI SDK — `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`

---

## Phase 1: 组件基础（P0 阻塞项）

**目标**：完成所有独立 UI 组件，使页面组装成为可能

- [x] T010 [P] 创建 components/playground/error-display.tsx — 分类错误展示组件，支持 5 种 error.type（auth/rate_limit/context_length/network/unknown），使用 @theme tokens，不硬编码颜色 (15 min)
- [x] T011 [P] 创建 components/playground/model-selector.tsx — 模型下拉选择器，接收 `models` 列表 + `value` + `onChange` + `disabled` props，使用 shadcn Select 组件 (15 min)
- [x] T012 [P] 创建 components/playground/thinking-card.tsx — 思考过程时间线卡片，接收 `ThinkingStep[]` props，每步显示时间戳 + 内容，数组为空时显示骨架屏 (20 min)
- [x] T013 [P] 创建 components/playground/tool-call-card.tsx — 工具调用表格卡片，接收 `ToolCall[]` props，用 shadcn Table 渲染 name/input/output/duration，数组为空时显示骨架屏 (20 min)
- [x] T014 [P] 创建 components/playground/answer-card.tsx — 最终答案 markdown 卡片，接收 `string` props，用 `<pre>` 或 `react-markdown` 渲染，空值时显示骨架屏 (15 min)

**依赖**：T010-T014 互相独立，可并行执行
**测试标准**：每个组件可独立导入并渲染，props 类型正确，无运行时错误

---

## Phase 2: 输入与响应区（P0 核心）

**目标**：完成 prompt 输入和响应聚合组件，连接 useObject hook

- [x] T020 创建 components/playground/prompt-input.tsx — 多行输入框 + 发送/清空按钮 + 字符计数器（MAX 8000），支持 Cmd/Ctrl+Enter 发送，props: `value`, `onChange`, `onSend`, `onClear`, `isLoading`, `disabled` (25 min)
  - 依赖: T010（错误态可复用 error-display 的样式约定）
- [x] T021 创建 components/playground/response-area.tsx — 响应区容器，接收 `partialObject`（useObject 返回值），根据字段到达情况条件渲染 thinking-card / tool-call-card / answer-card，卡片间距 24px，底部提供"复制原始 JSON"按钮 (30 min)
  - 依赖: T012, T013, T014
- [x] T022 在 globals.css 中为 skeleton 和 loading-dots 补充 Playground 所需的动画 keyframes（如果已有则跳过） (5 min)

**依赖**：T020 → T010（样式约定），T021 → T012, T013, T014
**测试标准**：输入区能正常输入/清空/计数；响应区能根据 partialObject 正确显示/隐藏卡片

---

## Phase 3: 主页面组装（P0 集成）

**目标**：组装所有组件为完整页面，接入 useObject

- [x] T030 创建 app/playground/page.tsx — Playground 主页面（"use client"），集成：
  - 顶部：model-selector（T011）
  - 中部：prompt-input（T020）
  - 底部：response-area（T021）+ error-display（T010）
  - 使用 `useObject({ api: '/api/playground/stream' })` 发起流式请求
  - 管理状态：selectedModel, input, isLoading, partialObject, error
  - 请求中：禁用 model-selector + 发送按钮（FR-7）
  - 请求完成：显示"复制 JSON"按钮（FR-5）
  - 请求失败：展示 error-display（FR-6） (40 min)
  - 依赖: T011, T020, T021, T010

**测试标准**：页面可访问 `/playground`，选择模型 → 输入 → 发送 → 能看到流式响应（成功或错误）

---

## Phase 4: Header 导航接入（P1）

**目标**：让 Playground 可从导航栏访问

- [x] T040 修改 components/layout/header.tsx — 在 navItems 数组中新增 Playground 入口：`{ label: 'Playground', href: '/playground' }`，同时添加 `usePathname` 高亮判断 (10 min)

**测试标准**：Header 中可见 "Playground" 链接，点击跳转 `/playground`，当前页高亮正确

---

## Phase 5: 响应式与体验优化（P2）

**目标**：确保 768px+ 响应式体验，优化细节

- [x] T050 检查 app/playground/page.tsx 在 768px / 1280px 断点下的布局 —— 确保模型选择器、输入框、响应区在小屏下正确堆叠，不溢出 (20 min)
- [x] T051 优化 thinking-card 时间线样式 —— 确保 ThinkingStep 之间的视觉分隔清晰，timestamp 字号适中 (15 min)
- [x] T052 优化 tool-call-card 表格样式 —— 确保长 input/output 文本不会撑破布局，使用 truncate + tooltip (20 min)

**测试标准**：浏览器窗口从 1280px 缩放到 768px，所有元素正常显示无溢出

---

## 依赖图

```
T010 ──┐
T011 ──┤         ┌── T020 ──┐
T012 ──┤         │           │
T013 ──┼── T021 ─┤           ├── T030 ── T040
T014 ──┤         │           │
T000 ──┘         └── T022 ──┘
```

**并行机会**：
- Phase 1（T010-T014）5 个组件完全独立，可并行
- Phase 2 中 T020 和 T022 可并行（T021 需等 T012-T014）

## 实现策略

1. **MVP 范围**：完成 Phase 1 + Phase 2 + Phase 3 → 即可获得一个可运行的 Playground（T000-T030）
2. **增量交付**：每完成一个 Phase 即可 `pnpm dev` 验证，无需等全部完成
3. **风险优先级**：先做 T010（error-display），因为 API Route 已存在，可以立即用 curl 测试错误分类是否正常工作
