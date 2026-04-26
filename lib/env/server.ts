import { z } from 'zod'

/**
 * Server-only environment variables.
 * Loaded only in Node.js runtime (API routes, server components).
 */
export const ServerEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY 不能为空'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY 不能为空'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, 'GOOGLE_GENERATIVE_AI_API_KEY 不能为空'),
  DEEPSEEK_API_KEY: z.string().min(1, 'DEEPSEEK_API_KEY 不能为空'),
  DASHSCOPE_API_KEY: z.string().min(1, 'DASHSCOPE_API_KEY 不能为空'),
  TURSO_DATABASE_URL: z.string().url('TURSO_DATABASE_URL 必须是有效 URL'),
  TURSO_AUTH_TOKEN: z.string().min(1, 'TURSO_AUTH_TOKEN 不能为空'),
})

export type ServerEnv = z.infer<typeof ServerEnvSchema>

/**
 * 校验环境变量并返回结果（开发模式允许空 Key 但给警告）
 */
export function validateServerEnv(): ServerEnv {
  const env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
    DEEPSEEK_API_KEY: process.env.DEESEEK_API_KEY ?? '',
    DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY ?? '',
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? '',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? '',
  }

  const result = ServerEnvSchema.safeParse(env)

  if (!result.success) {
    const missing = result.error.errors.map((e) => `  - ${e.message}`).join('\n')
    const warning = `\n[AgentHub] 环境变量校验失败:\n${missing}\n使用默认空值，AI 调用将失败。`

    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      throw new Error(warning)
    }

    console.warn(warning)
    return env as unknown as ServerEnv
  }

  return result.data
}
