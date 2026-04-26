import { z } from 'zod'

/**
 * Client-only environment variables (NEXT_PUBLIC_*).
 * Available in browser runtime.
 */
export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('AgentHub'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.1.0'),
})

export type ClientEnv = z.infer<typeof ClientEnvSchema>

export function validateClientEnv(): ClientEnv {
  const env = {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? '',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '',
  }

  const result = ClientEnvSchema.safeParse(env)

  if (!result.success) {
    console.error('[AgentHub] 客户端环境变量校验失败:', result.error.errors)
    return env as ClientEnv
  }

  return result.data
}
