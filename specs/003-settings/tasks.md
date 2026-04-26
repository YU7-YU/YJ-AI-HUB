# Settings 页 - 任务清单

**Feature**: Settings 页 — 模型选择、API Key 管理、Token 预警、Playground 预估
**Spec**: [specs/003-settings/spec.md](spec.md)
**Plan**: [specs/003-settings/plan.md](plan.md)
**Created**: 2026-04-26

---

## 已完成任务

- [x] T000 [P] 生成 specs/003-settings/spec.md — Settings 页规格文档
- [x] T001 生成 specs/003-settings/checklists/requirements.md — 规格质量检查清单

---

## Phase 1: 基础设施（P0 阻塞项）

**目标**：安装 `js-tiktoken` 依赖、创建模型定价表、环境变量 Zod 校验

- [x] T010 [P] 安装 `js-tiktoken` 依赖 — `pnpm add js-tiktoken`
- [x] T011 [P] 创建 `shared/config/model-pricing.ts` — 模型定价数据抽象
- [ ] T012 创建 `lib/env/validate.ts` — Zod 环境变量校验（本期跳过，后续加）

**依赖**：T010、T011 已完成
**测试标准**：✅ `pnpm build` 通过

---

## Phase 2: Token 计数工具（P0 阻塞项）

**目标**：创建 Token 计数和费用预估工具函数

- [x] T020 [P] 创建 `lib/token-counter.ts` — Token 计数封装（js-tiktoken o200k_base）
- [x] T021 [P] 创建 `lib/cost-calculator.ts` — 费用计算 + 格式化 + 色阶
- [x] T022 统一导出（直接在 cost-calculator.ts 中完成）

**依赖**：已完成
**测试标准**：✅ build 通过

---

## Phase 3: [US1] Settings 页面重构（P0 核心）

**用户故事**：作为 AgentHub 用户，我希望有一个 Settings 页来管理我的模型配置和 API Key

- [x] T030 [P] [US1] 创建 `lib/settings/storage.ts` — 本地存储封装
- [x] T031 [P] [US1] 创建 `components/settings/model-list.tsx` — 模型选择 Radio 列表
- [x] T032 [P] [US1] 创建 `components/settings/api-key-manager.tsx` — API Key 管理
- [x] T033 [P] [US1] 创建 `components/settings/threshold-input.tsx` — Token 预警阈值
- [x] T034 [US1] 创建 `lib/utils/mask.ts` — API Key 脱敏工具函数
- [x] T035 [US1] 重写 `app/settings/page.tsx` — Settings 主页面

**依赖**：已完成
**测试标准**：访问 `/settings` 可完成模型切换、API Key 编辑/删除、预警阈值设置

---

## Phase 4: [US2] Playground Token 预估集成（P0 核心）

**用户故事**：作为 AgentHub 用户，我希望在 Playground 输入 prompt 时实时看到 Token 预估和费用

- [x] T040 [P] [US2] 创建 `components/playground/token-estimator.tsx` — Token 预估显示组件
- [x] T041 [US2] 修改 `app/playground/page.tsx` — 集成 Token 预估

**依赖**：已完成
**测试标准**：在 Playground 输入文本时实时看到 Token 数和费用预估

---

## Phase 5: 响应式与体验优化（P2）

- [ ] T050 检查响应式断点
- [ ] T051 优化 API Key 编辑体验
- [ ] T052 优化 Token 预估组件

---

## 依赖图

```
T010 ──┐
       └── T011 ──────────────┐
                             │
T020 ──┐                     │
       └── T021 ── T022 ──┬──┤
                          │  │
T030 ──┬── T031 ──┐       │  │
       │           │       │  │
       ├── T032 ←──┤ T034  │  │
       │           │       │  │
       └── T033 ───┘── T035┤
                           │
T040 ──┐                   │
       └── T041 ───────────┘

T050 ──┐
T051 ──┤ （Phase 5）
T052 ──┘
```
