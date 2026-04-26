# Spec: 004-particle-bg — Landing Hero 动态粒子背景

## Summary
在 Landing 页 Hero 区（"一站式 AI Agent 构建、编排与分发平台" 那一屏）背后增加一层轻量动态粒子背景，提升视觉第一印象。

## Requirements
- 使用自研 Canvas 实现，零新依赖
- 粒子数量：桌面端 60 个，移动端（≤768px）20 个
- 粒子颜色：从 @theme 取 `var(--color-primary)` 即 `hsl(220, 90%, 60%)`，透明度 0.3-0.6 随机
- 粒子缓慢匀速直线漂浮，碰壁反弹
- 不需要鼠标交互（无跟随、无排斥）
- 必须响应 `prefers-reduced-motion`：降级为静态渐变背景，无动画
- 暗色模式为主，不响应主题切换
- 粒子大小 1-3px 随机

## Non-Goals / Out of Scope
- **不修改** Landing 页除 Hero section 以外的任何 section（精选 Agent、ValueProps、Stats、CTA）
- **不修改** 其他页面（/gallery、/pricing、/admin 等）
- **不引入** 新 npm 依赖（如 tsparticles、react-particles 等）
- **不修改** @theme token / globals.css 中的 CSS 变量定义
- **不添加** 鼠标交互效果（跟随、连线、排斥等）
- **不实现** 主题切换响应（仅暗色）
- **不改动** Header / Footer 组件

## Acceptance Criteria
1. Hero 区可见缓慢漂浮的蓝色小粒子
2. 移动端粒子数量降至 20
3. 开启 `prefers-reduced-motion` 后粒子动画停止，显示静态渐变
4. 页面性能 60fps，无明显卡顿
5. 构建通过 `pnpm build`，无 hydration warning
6. `git diff main -- app/` 只显示 2 个文件变更
