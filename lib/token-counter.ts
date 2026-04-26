import { Tiktoken } from 'js-tiktoken'

let encoder: Tiktoken | null = null

function getEncoder(): Tiktoken {
  if (!encoder) {
    encoder = new Tiktoken('o200k_base')
  }
  return encoder
}

/**
 * 计算文本的 token 数量（使用 o200k_base 编码）
 */
export function countTokens(text: string): number {
  const tokens = getEncoder().encode(text)
  return tokens.length
}
