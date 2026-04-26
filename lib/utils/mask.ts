/**
 * 脱敏 API Key：前 3 位 + "****" + 末 4 位
 * 不足 7 位时全部替换为 "****"
 */
export function maskApiKey(key: string): string {
  if (!key) return ''
  if (key.length <= 7) return '****'
  return `${key.slice(0, 3)}****${key.slice(-4)}`
}
