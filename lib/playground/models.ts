export type ModelConfig = {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google'
  envKey: string
  envBaseUrl?: string
  structuredOutput: boolean
}

export const models: ModelConfig[] = [
  {
    id: 'gpt-5.3',
    name: 'GPT-5.3',
    provider: 'openai',
    envKey: 'OPENAI_API_KEY',
    structuredOutput: true,
  },
  {
    id: 'claude-4.7',
    name: 'Claude 4.7',
    provider: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    structuredOutput: true,
  },
  {
    id: 'gemini-3.1-flash',
    name: 'Gemini 3.1 Flash',
    provider: 'google',
    envKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    structuredOutput: true,
  },
  {
    id: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'openai',
    envKey: 'DEEPSEEK_API_KEY',
    envBaseUrl: 'DEEPSEEK_BASE_URL',
    structuredOutput: true,
  },
  {
    id: 'qwen-3.5-flash',
    name: 'Qwen 3.5 Flash',
    provider: 'openai',
    envKey: 'DASHSCOPE_API_KEY',
    envBaseUrl: 'DASHSCOPE_BASE_URL',
    structuredOutput: true,
  },
]

export function getModelById(id: string): ModelConfig | undefined {
  return models.find((m) => m.id === id)
}
