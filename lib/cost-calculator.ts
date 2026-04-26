import { getModelPricing } from '@/shared/config/model-pricing'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

/**
 * 根据 token 数量和模型计算预估费用（$）
 */
export function calculateCost(tokens: number, modelId: string): number {
  const pricing = getModelPricing(modelId)
  if (!pricing) return 0
  return (tokens * pricing.inputPricePer1M) / 1_000_000
}

/**
 * 格式化费用金额（如 $0.0360）
 */
export function formatCost(cost: number): string {
  return usdFormatter.format(cost)
}

/**
 * 根据费用和阈值判断颜色等级
 */
export function getCostLevel(cost: number, threshold: number): 'low' | 'medium' | 'high' {
  if (cost > threshold || cost > 0.5) return 'high'
  if (cost >= 0.1) return 'medium'
  return 'low'
}
