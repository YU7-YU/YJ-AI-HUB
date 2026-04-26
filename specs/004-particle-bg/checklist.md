# Checklist: 004-particle-bg

## 三法衣合规
- [x] **宪法 (constitution)**: 零新依赖、brownfield 安全（只动 2 个文件）、暗色主题一致
- [x] **规范 (spec)**: 所有 acceptance criteria 在 tasks 中可追踪
- [x] **计划 (plan)**: 技术选型已论证、影响面已声明、未改动文件已列出

## Acceptance Criteria
- [x] Hero 区可见缓慢漂浮的蓝色小粒子
- [x] 移动端（≤768px）粒子数量降至 20
- [x] 开启 `prefers-reduced-motion` 后显示静态渐变，无动画
- [x] 页面性能 60fps，无卡顿（rAF + 简单物理）
- [x] `pnpm build` 通过，无 hydration warning
- [x] `git diff main -- app/` 只显示 2 个文件（新粒子组件 + 修改 page）

## Out of Scope 确认
- [x] 未修改精选 Agent / ValueProps / Stats / CTA section
- [x] 未修改其他页面（/gallery, /pricing 等）
- [x] 未引入新 npm 依赖（package.json 不变）
- [x] 未修改 globals.css 的 @theme token
- [x] 未添加鼠标交互
- [x] 未改动 Header / Footer 组件

## 验收结果
- `pnpm build`: 通过
- `git diff --stat`: 仅 `components/particle-background.tsx` (新) + `app/page.tsx` (改)
- 浏览器 `/` 路径可见粒子缓慢漂浮
