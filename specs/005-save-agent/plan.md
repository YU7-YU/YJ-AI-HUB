# Plan: 005-save-agent — localStorage 持久化 Agent 收藏

## Technical Decision
| Approach | Bundle Impact | Dependencies | Verdict |
|----------|--------------|--------------|---------|
| Zod schema + custom hook | ~1KB (Zod 已装) | 0 new | **推荐** |
| JSON.parse + 手动校验 | ~0.3KB | 0 | 可但易漏边界 |
| 无 hook，直接 inline localStorage | ~0.2KB | 0 | 不可复用，违反可维护性 |

选择：Zod + 自定义 hook — 项目已有 zod，且需求明确要 schema 校验。

## File Impact
### New Files
- `lib/schemas/my-agents.ts` — Zod schema：`z.array(z.string().min(1).max(64)).max(100)`
- `lib/hooks/use-my-agents.ts` — React hook：localStorage 读写 + SSR gate

### Modified Files
- `app/agent/[id]/page.tsx` — 仅第 179-182 行 Button：加 `onClick` + 动态 label/icon

### Brownfield Safety — Files That Will NOT Be Touched (≥10)
1. `app/layout.tsx`
2. `app/globals.css`
3. `app/page.tsx`
4. `app/gallery/page.tsx`
5. `app/pricing/page.tsx`
6. `app/runs/page.tsx`
7. `components/layout/header.tsx`
8. `components/layout/footer.tsx`
9. `components/agent-card.tsx`
10. `lib/mock-data.ts`
11. `package.json`
12. `tsconfig.json`
13. `next.config.mjs`

## SSR Handling
- 使用 `isHydrated` 门闸模式：`useState(false)` + `useEffect(() => setIsHydrated(true), [])`
- `!isHydrated` 时返回 `saved = false`（按钮显示默认文案）
- 仅在 `isHydrated && typeof window !== 'undefined'` 时才读 localStorage
- 写入时 `safeParse` Zod schema，不合法时丢弃并重置为空数组

## Performance
- 单次 localStorage read on mount（微秒级）
- 无 rAF / 无网络请求 / 无副作用
