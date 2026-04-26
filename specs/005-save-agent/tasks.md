# Tasks: 005-save-agent

1. [ ] 新建 `lib/schemas/my-agents.ts` — 定义 `myAgentsSchema = z.array(z.string().min(1).max(64)).max(100)`
2. [ ] 新建 `lib/hooks/use-my-agents.ts` — 实现 `useMyAgents(agentId)` hook：SSR gate + localStorage 读写 + Zod safeParse + toggle 逻辑
3. [ ] 修改 `app/agent/[id]/page.tsx` 的 Button（第 179 行附近）— 加 `onClick` + 动态 label + 动态 icon
4. [ ] 验证 `pnpm build` 通过，无 hydration warning
5. [ ] 创建 `specs/005-save-agent/checklist.md` 并逐项验收
