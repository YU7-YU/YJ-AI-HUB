# Spec: 005-save-agent — 让"添加到我的 Agent"按钮真正工作

## Summary
将 `/agent/[id]` 页面上"添加到我的 Agent"按钮从纯展示变为可交互的 toggle 功能，使用 `localStorage` 持久化用户收藏的 agent id 列表。

## Requirements
- **存什么**：仅存 `agent.id` 字符串数组（不复制整个 agent 对象）
- **上限**：最多 100 个（防 localStorage 溢出）
- **key 名**：`agenthub:myAgents`
- **校验**：读回时用 Zod 校验 `z.array(z.string().min(1).max(64)).max(100)`
- **交互**：点击按钮 → toggle：未添加则添加，已添加则移除
- **视觉反馈**：未添加时显示"添加到我的 Agent" + `Plus` 图标；已添加时显示"已添加到我的 Agent ✓" + `Check` 图标 + success 色调
- **SSR/Hydration**：首渲染默认 label 为"添加到我的 Agent"；`useEffect` 挂载后读 localStorage 再切真实状态。禁止 render 阶段读 localStorage（避免 hydration mismatch）
- **可复用 hook**：提供 `useMyAgents()` hook，返回 `{ isSaved, toggle, myAgentIds }`

## Non-Goals / Out of Scope
- **不做** 用户系统 / 登录 / 注册
- **不接** Turso / 数据库 / 后端 API
- **不改** Gallery 页、RunHistory 页、Settings 页
- **不改** `/agent/[id]` 除那一个 Button 以外的任何部分
- **不引入** 新 npm 依赖
- **不改** `mock-data.ts`
- **不做** "我的 Agent 列表"页（本期）

## Acceptance Criteria
1. 浏览器打开 `/agent/agent-1` 点击按钮 → 变"已添加到我的 Agent ✓"
2. 刷新页面状态保持（来自 localStorage）
3. 再点一次 → toggle 回"添加到我的 Agent"
4. `pnpm build` 通过，无 hydration warning
5. `git diff HEAD~1 -- app/` 只 3 个文件
6. Zod 校验生效，手动篡改 localStorage 值不会 crash
