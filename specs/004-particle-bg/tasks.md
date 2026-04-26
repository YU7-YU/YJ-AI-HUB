# Tasks: 004-particle-bg

1. [ ] 新建 `components/particle-background.tsx` — "use client" Canvas 粒子组件，包含 Particle 类型定义、canvas ref、useEffect 启动 rAF 循环
2. [ ] 实现粒子初始化逻辑 — 随机位置/速度/大小/透明度，桌面 60 / 移动 20
3. [ ] 实现 rAF 动画循环 — 粒子移动 + 碰壁反弹 + canvas 重绘
4. [ ] 实现 prefers-reduced-motion 检测 — 降级为静态渐变，无动画
5. [ ] 实现 CSS token 读取 — `getComputedStyle` 取 `--color-primary`
6. [ ] 修改 `app/page.tsx` Hero section — 插入 `<ParticleBackground />`，hero 内容包 `relative z-10`
7. [ ] 验证 `pnpm build` 通过，无 hydration warning
