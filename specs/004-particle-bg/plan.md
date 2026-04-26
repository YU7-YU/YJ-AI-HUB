# Plan: 004-particle-bg — Landing Hero 动态粒子背景

## Technical Decision
| Approach | Bundle Size | Dependencies | Flexibility | Verdict |
|----------|------------|--------------|-------------|---------|
| 手写 Canvas 组件 | ~2KB | 0 | 高 | **推荐** |
| tsparticles | ~45KB | 1 (tsparticles) | 中 | 过重 |
| react-tsparticles | ~50KB | 2 (react+tsparticles) | 中 | 过重 |

选择：手写 Canvas 组件 — 最轻、无新依赖、完全可控。

## File Impact
### New Files
- `components/particle-background.tsx` — "use client" Canvas 粒子组件

### Modified Files
- `app/page.tsx` — Hero section 插入 `<ParticleBackground />`

### Brownfield Safety — Files That Will NOT Be Touched (≥10)
1. `components/layout/header.tsx`
2. `components/layout/footer.tsx`
3. `components/agent-card.tsx`
4. `lib/mock-data.ts`
5. `app/globals.css`
6. `app/layout.tsx`
7. `app/gallery/page.tsx`
8. `app/pricing/page.tsx`
9. `components/ui/button.tsx`
10. `tsconfig.json`
11. `next.config.mjs`
12. `package.json`

## Performance Targets
- 60fps on modern desktop
- Component bundle < 3KB (gzipped)
- Zero new dependencies
- Single `requestAnimationFrame` loop
- Canvas is `pointer-events-none` to avoid blocking hero interaction

## Implementation Approach
1. Create `components/particle-background.tsx` with:
   - `"use client"` directive
   - Canvas element positioned `absolute inset-0`
   - `requestAnimationFrame` loop with particle physics
   - `prefers-reduced-motion` media query detection
   - Desktop (60) / mobile (20) particle count via `window.innerWidth`
   - Color via `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')`
2. Modify Hero section in `app/page.tsx`:
   - Section already has `relative overflow-hidden`
   - Insert `<ParticleBackground />` as first child
   - Wrap existing hero content in `div className="relative z-10"`
