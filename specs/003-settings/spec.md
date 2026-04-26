# Settings 页 - Spec v1.0

## 1. 概述

### 1.1 背景
AgentHub 用户需要管理 AI 模型的配置——选择默认模型、查看和编辑各 provider 的 API Key、设置 Token 消耗预警阈值，并在 Playground 输入 prompt 时实时预估 Token 数量和费用。

### 1.2 目标
构建一个 Settings 页面，支持：
- 默认模型选择（Radio 列表，含厂商 + 定价信息）
- API Key 管理（脱敏展示 + 编辑 + 删除）
- Token 预警阈值设置（$0.01 - $10 范围，超阈值标红）
- Playground 页集成实时 Token 预估（纯前端计算，< 100ms）

### 1.3 范围
**本期包含**：
- Settings 页：模型选择、API Key 管理、Token 预警
- `shared/config/model-pricing.ts`：模型定价表抽象
- `js-tiktoken` 集成：Edge Runtime 兼容的 Token 计数
- Playground 页集成 Token 预估显示
- Zod schema 环境变量校验（build-time）

**本期不包含**（v2+）：
- 团队共享 Key
- 使用量计费账单页
- 订阅管理

---

## 2. 用户故事

> 作为 AgentHub 用户，我希望有一个 Settings 页来管理我的模型配置和 API Key，
> 并在 Playground 输入时实时看到 Token 预估和费用，
> 帮助我控制成本、避免意外的高额 API 费用。

---

## 3. 用户场景与测试

### 场景 1：查看和切换默认模型
1. 用户进入 Settings → "模型设置" 区域
2. 看到可用模型的 Radio 列表，每行显示：模型名称 / 厂商 / 输入价格 / 输出价格
3. 当前默认模型已选中
4. 用户点击另一个模型，默认模型立即切换

**验证点**：
- 至少 6 个模型可选
- 定价信息来自 `shared/config/model-pricing.ts`，不是写死在 UI
- 切换后立即在 Playground 生效（无需刷新）

### 场景 2：管理 API Key
1. 用户进入 Settings → "API 密钥" 区域
2. 看到已配置的 provider 列表（OpenAI / Anthropic / DeepSeek）
3. 每个 provider 的 Key 以脱敏格式显示：`sk-****1234`（"sk-" + "****" + 末 4 位）
4. 用户点击"编辑"可修改 Key，"删除"可移除 Key
5. 未配置的 provider 显示"配置"按钮

**验证点**：
- 脱敏格式严格遵循："sk-" + "****" + 末 4 位
- 编辑后保存立即生效（更新 .env 或通过 Settings API）
- 删除后对应 provider 不可用

### 场景 3：设置 Token 预警阈值
1. 用户进入 Settings → "预警设置" 区域
2. 看到一个阈值输入框（范围 $0.01 - $10，步进 $0.01）
3. 用户输入 $0.50 作为阈值
4. 超过阈值时输入框变红

**验证点**：
- 输入范围校验（$0.01 最小值，$10 最大值）
- 超阈值时视觉反馈明确（红色边框 + 提示文字）

### 场景 4：Playground Token 实时预估
1. 用户在 Playground 页输入 prompt
2. 输入框下方实时显示："约 1200 tokens · $0.036"
3. 预估颜色根据费用变化：
   - 绿色：< $0.10
   - 黄色：$0.10 - $0.50
   - 红色：> $0.50
4. 预估在输入变化后 < 100ms 更新

**验证点**：
- 纯前端计算（不调用 API）
- Token 计数使用 `js-tiktoken`（与 OpenAI API 行为一致）
- 费用 = tokens × 当前模型单价
- 颜色与 Settings 中的阈值设置联动

### 场景 5：未配置 API Key 的引导
1. 用户首次访问 Settings，没有任何 API Key 配置
2. 页面显示引导："尚未配置任何 API Key" + "前往配置" 按钮
3. 点击"前往配置"后进入编辑态

### 场景 6：环境变量缺失时的 Build 报错
1. 开发者启动项目时，`.env.local` 中缺少必要的 API Key
2. Zod 校验在 build-time 立即报错，阻止启动
3. 错误信息明确：哪个 Key 缺失、期望格式是什么

---

## 4. 功能需求

### FR-1: 默认模型选择

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | Radio 列表展示可用模型，每行包含模型名称、厂商、输入价、输出价 |
| 验收标准 | 至少 6 个模型可选；当前默认模型已选中；切换后 Playground 页默认使用该模型；定价数据来自 `shared/config/model-pricing.ts` |

### FR-2: API Key 管理

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | 展示已配置的 provider API Key（脱敏），支持编辑和删除 |
| 验收标准 | 脱敏格式："sk-" + "****" + 末 4 位（如果 Key 不足 4 位则全部脱敏）；OpenAI / Anthropic / DeepSeek 至少 3 个 provider；编辑时输入框不脱敏，保存后恢复脱敏；删除需确认 |

### FR-3: Token 预警阈值

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | 设置单次请求费用预警阈值，范围 $0.01 - $10 |
| 验收标准 | 输入范围校验（$0.01 最小 / $10 最大）；超阈值时输入框红色边框 + 提示文字 "超出预警阈值"；阈值存储在浏览器 localStorage 或 Settings API |

### FR-4: Playground Token 预估

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | Playground 输入框下方实时显示预估 Token 数量和费用 |
| 验收标准 | 显示格式 "约 N tokens · $X.XX"；颜色跟随费用变化（绿 < $0.10 / 黄 $0.10-$0.50 / 红 > $0.50）；预估延迟 < 100ms；纯前端计算（不调 API）；使用 `js-tiktoken` 计数 |

### FR-5: 模型定价表

| 字段 | 描述 |
|------|------|
| 优先级 | P0 |
| 描述 | 模型定价数据抽象为独立文件，不写死在 UI 组件中 |
| 验收标准 | `shared/config/model-pricing.ts` 包含所有模型的输入价 / 输出价（单位：$ / 1M tokens）；至少 6 个模型；数据格式可被 Settings UI 和 Playground 预估同时使用 |

### FR-6: 环境变量 Zod 校验

| 字段 | 描述 |
|------|------|
| 优先级 | P1 |
| 描述 | 环境变量在 build-time 用 Zod schema 校验，不合法则报错 |
| 验收标准 | 启动时检查 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY` 等是否满足格式要求；不合法时报错并说明缺失的 Key；不阻断开发模式（允许空 Key 启动，但给出警告） |

---

## 5. 非功能需求

### NFR-1: 安全性

| 字段 | 描述 |
|------|------|
| 指标 | API Key 永远不以完整形式展示，展示时永远脱敏（"sk-" + "****" + 末 4 位） |
| 验证方式 | 代码审查：所有展示 Key 的地方必须调用 `maskApiKey()` 工具函数 |

### NFR-2: Token 计数

| 字段 | 描述 |
|------|------|
| 指标 | 使用 `js-tiktoken`（Edge Runtime 兼容），禁止使用原生 `tiktoken` |
| 验证方式 | 代码审查：无 `tiktoken` import；`js-tiktoken` 的 bundle 大小 < 100KB（gzip） |

### NFR-3: 样式

| 字段 | 描述 |
|------|------|
| 指标 | 所有颜色/间距使用 @theme tokens，禁止硬编码 hex 颜色值 |
| 验证方式 | 代码审查无硬编码 color/hex |

### NFR-4: 预估性能

| 字段 | 描述 |
|------|------|
| 指标 | Token 预估在输入变化后 < 100ms 完成计算 |
| 验证方式 | 使用 `console.time` 或性能工具验证 |

### NFR-5: 响应式

| 字段 | 描述 |
|------|------|
| 指标 | Settings 页最小支持 768px |
| 验证方式 | 浏览器窗口缩放测试 |

---

## 6. 关键实体

### ModelPricing（模型定价）

```
ModelPricing
├── id: string              // 模型 ID（如 "gpt-5.3"）
├── name: string            // 展示名称
├── provider: string        // "openai" | "anthropic" | "deepseek"
├── inputPricePer1M: number // 输入价格（$ / 1M tokens）
├── outputPricePer1M: number // 输出价格（$ / 1M tokens）
└── contextWindow: number   // 上下文窗口大小（tokens）
```

### TokenEstimate（Token 预估）

```
TokenEstimate
├── inputTokens: number     // 预估输入 tokens
├── estimatedCost: number   // 预估费用（$）
├── costLevel: 'low' | 'medium' | 'high'  // 颜色等级
└── modelName: string       // 当前选中的模型
```

### AlertThreshold（预警阈值）

```
AlertThreshold
├── value: number           // 阈值金额（$）
├── enabled: boolean        // 是否启用
└── level: 'low' | 'medium' | 'critical'  // 预警级别
```

---

## 7. 假设

- 现有的 Settings 页面（`app/settings/page.tsx`）是 Prep-02 的占位 UI，需要替换为真实功能
- API Key 存储在 `.env.local` 中，Settings 页通过 API Route 读取/更新（或通过 `next/server` 的环境变量访问）
- `js-tiktoken` 在 Edge Runtime 下兼容（不依赖 Node.js 原生模块）
- 默认模型选择存储在浏览器 localStorage 或用户偏好 API 中
- Token 预警阈值存储在浏览器 localStorage（单用户场景）
- 模型定价表包含至少 6 个模型：GPT-5.3、GPT-4o、Claude 4.7、Claude 3.5 Sonnet、DeepSeek V3.2、Qwen 3.5 Flash

---

## 8. 依赖

- Next.js 15（已有）
- React 19（已有）
- `js-tiktoken`（需安装）
- Zod（已有）
- shadcn/ui（已有，RadioGroup / Input / Switch 等）
- `@theme` tokens（已有）

---

## 9. 待确认事项

> 无 [NEEDS CLARIFICATION] 标记——所有关键决策点已明确。
