import { z } from 'zod'

// --- Schema Definition ---

export const ModelProviderSchema = z.enum(['openai', 'anthropic', 'deepseek'])
export type ModelProvider = z.infer<typeof ModelProviderSchema>

export const ModelPricingSchema = z.object({
  id: z.string(),                  // 模型 ID（如 "gpt-5.3"）
  name: z.string(),                // 展示名称
  provider: ModelProviderSchema,   // 厂商
  inputPricePer1M: z.number(),     // 输入价格（$ / 1M tokens）
  outputPricePer1M: z.number(),    // 输出价格（$ / 1M tokens）
  contextWindow: z.number(),       // 上下文窗口大小（tokens）
})
export type ModelPricing = z.infer<typeof ModelPricingSchema>

// --- Data: 3 Providers, 6 Models ---

export const MODEL_PRICING: ModelPricing[] = [
  // OpenAI
  {
    id: 'gpt-5.3',
    name: 'GPT-5.3',
    provider: 'openai',
    inputPricePer1M: 1.25,
    outputPricePer1M: 10,
    contextWindow: 200_000,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    inputPricePer1M: 2.5,
    outputPricePer1M: 10,
    contextWindow: 128_000,
  },

  // Anthropic
  {
    id: 'claude-4.7',
    name: 'Claude 4.7',
    provider: 'anthropic',
    inputPricePer1M: 3,
    outputPricePer1M: 15,
    contextWindow: 200_000,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    inputPricePer1M: 3,
    outputPricePer1M: 15,
    contextWindow: 200_000,
  },

  // DeepSeek
  {
    id: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'deepseek',
    inputPricePer1M: 0.14,
    outputPricePer1M: 0.56,
    contextWindow: 128_000,
  },

  // Alibaba (DashScope / Qwen) — OpenAI compatible
  {
    id: 'qwen-3.5-flash',
    name: 'Qwen 3.5 Flash',
    provider: 'openai',
    inputPricePer1M: 0.1,
    outputPricePer1M: 0.3,
    contextWindow: 32_000,
  },
]

// --- Utility Functions ---

export function getModelPricing(id: string): ModelPricing | undefined {
  return MODEL_PRICING.find((m) => m.id === id)
}

export function getAllModelPricing(): ModelPricing[] {
  return [...MODEL_PRICING]
}

export function getProviderPricing(provider: ModelProvider): ModelPricing[] {
  return MODEL_PRICING.filter((m) => m.provider === provider)
}

export function calculateCost(tokens: number, modelId: string): number {
  const pricing = getModelPricing(modelId)
  if (!pricing) return 0
  return (tokens * pricing.inputPricePer1M) / 1_000_000
}
