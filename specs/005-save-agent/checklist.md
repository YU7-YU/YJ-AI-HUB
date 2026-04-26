# Checklist: 005-save-agent

## 三法衣合规
- [x] **宪法**: 零新依赖、brownfield 安全（只动 3 个文件）
- [x] **规范**: 所有 acceptance criteria 可追踪
- [x] **计划**: 技术选型已论证、影响面已声明

## Acceptance Criteria
- [x] 打开 `/agent/agent-1` 点按钮 → 变"已添加到我的 Agent ✓"
- [x] 刷新页面状态保持（localStorage）
- [x] 再点一次 → toggle 回"添加到我的 Agent"
- [x] `pnpm build` 通过，无 hydration warning
- [x] `git diff HEAD~1` 只 3 个源文件变更
- [x] Zod 校验生效，手动篡改 localStorage 不 crash

## Out of Scope 确认
- [x] 未做用户系统/登录/注册
- [x] 未接 Turso/DB/后端 API
- [x] 未改 Gallery/RunHistory/Settings 页
- [x] 未改 `/agent/[id]` 除按钮外的任何部分
- [x] 未引入新 npm 依赖
- [x] 未改 mock-data.ts
