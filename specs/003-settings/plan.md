# Settings 页 - 技术计划

## 1. 技术上下文

- **Next.js 16.2.4** App Router + Turbopack
- **shadcn/ui** RadioGroup / Input / AlertDialog
- **js-tiktoken** Edge-compatible token counting
- **localStorage** 单用户设置持久化（无后端）
- **@theme tokens** 全部颜色/间距走 design system

## 2. 架构决策

### 决策 1: 设置存储方案
- **选择**: 浏览器 localStorage
- **理由**: 单用户场景，无后端 API 需求。设置量小（模型 ID、阈值、API Keys）
- **替代方案**: Server API Route（支持多设备同步）— v2 考虑

### 决策 2: Token 预估引擎
- **选择**: `js-tiktoken` o200k_base 编码，300ms debounce
- **理由**: NFR-2 明确要求 Edge 兼容，不依赖 Node 原生模块
- **替代方案**: 原生 `tiktoken`（Node only）— 不兼容 Edge

### 决策 3: Settings 页面 Server vs Client
- **选择**: Client Component（`'use client'`）
- **理由**: 页面需要大量交互状态（RadioGroup、编辑框、对话框）。无 SSR 数据需求
- **替代方案**: Server Component 读环境变量注入初始状态 — 但 localStorage 才是权威来源

### 决策 4: 默认模型跨页通信
- **选择**: `window.dispatchEvent(new CustomEvent('agenthub:defaultModelChanged'))`
- **理由**: Playground 和 Settings 是两个独立页面（非 SPA 路由内跳转），通过 CustomEvent 在 Settings 变更时通知 Playground
- **注意**: 如果用户在 Settings 改默认模型后返回 Playground，Playground 的初始 `selectedModel` 仍为 models[0]，但 TokenEstimator 组件会监听到事件更新

## 3. 数据流

```
Playground 输入 → debounce 300ms → js-tiktoken countTokens →
getModelPricing(modelId) → calculateCost → getCostLevel → 着色

Settings 切换模型 → setDefaultModel → dispatchEvent →
Playground TokenEstimator 监听到 → 重新计算费用
```

## 4. 文件结构

```
lib/
  token-counter.ts          # js-tiktoken 封装
  cost-calculator.ts        # 费用计算 + 格式化 + 色阶
  settings/
    storage.ts              # localStorage 读写 + window guard
  utils/
    mask.ts                 # API Key 脱敏
  env/
    server.ts               # 服务端 Zod env schema
    client.ts               # 客户端 Zod env schema
shared/
  config/
    model-pricing.ts        # 6 模型定价表
components/
  settings/
    model-list.tsx           # RadioGroup 模型列表
    api-key-manager.tsx      # API Key 管理
    threshold-input.tsx      # 预警阈值输入
  playground/
    token-estimator.tsx      # 实时 Token 预估
app/
  settings/page.tsx          # Settings 主页面
  layout.tsx                 # + env 校验入口
```

## 5. 环境变量

| 变量 | 用途 | 校验 |
|------|------|------|
| OPENAI_API_KEY | GPT 系列调用 | 非开发模式必填 |
| ANTHROPIC_API_KEY | Claude 调用 | 非开发模式必填 |
| GOOGLE_GENERATIVE_AI_API_KEY | Gemini 调用 | 非开发模式必填 |
| DEEPSEEK_API_KEY | DeepSeek 调用 | 非开发模式必填 |
| DASHSCOPE_API_KEY | Qwen 调用 | 非开发模式必填 |
| TURSO_DATABASE_URL | RunHistory 存储 | 生产模式必填 |
| TURSO_AUTH_TOKEN | RunHistory 认证 | 生产模式必填 |

## 6. 宪法检查

- ✅ Spec-Kit: spec.md + tasks.md + plan.md 三件套完整
- ✅ StyleSeed: 无硬编码颜色，间距走 4px 阶梯
- ✅ Figma Variables: 颜色走 theme tokens
