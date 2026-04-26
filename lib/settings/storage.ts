const PREFIX = 'agenthub_settings'

const KEYS = {
  defaultModel: `${PREFIX}:default_model`,
  alertThreshold: `${PREFIX}:alert_threshold`,
  apiKeys: `${PREFIX}:api_keys`,
} as const

// --- Default Model ---

export function getDefaultModel(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEYS.defaultModel) || null
}

export function setDefaultModel(modelId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.defaultModel, modelId)
  window.dispatchEvent(new CustomEvent('agenthub:defaultModelChanged', { detail: { modelId } }))
}

// --- Alert Threshold ---

const DEFAULT_THRESHOLD = 0.5

export function getAlertThreshold(): number {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLD
  const raw = localStorage.getItem(KEYS.alertThreshold)
  const parsed = parseFloat(raw || '')
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_THRESHOLD
}

export function setAlertThreshold(value: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.alertThreshold, String(value))
}

// --- API Keys ---

export function getApiKeys(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(KEYS.apiKeys)
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setApiKey(provider: string, key: string): void {
  if (typeof window === 'undefined') return
  const keys = getApiKeys()
  keys[provider] = key
  localStorage.setItem(KEYS.apiKeys, JSON.stringify(keys))
}

export function removeApiKey(provider: string): void {
  if (typeof window === 'undefined') return
  const keys = getApiKeys()
  delete keys[provider]
  localStorage.setItem(KEYS.apiKeys, JSON.stringify(keys))
}
