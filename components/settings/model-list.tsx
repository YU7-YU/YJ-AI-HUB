'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { getAllModelPricing, type ModelPricing } from '@/shared/config/model-pricing'
import { getDefaultModel, setDefaultModel } from '@/lib/settings/storage'
import { useEffect, useState } from 'react'

function PriceTag({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-xs text-foreground-muted">
      {label}${value.toFixed(2)}
    </span>
  )
}

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    deepseek: 'DeepSeek',
  }
  return (
    <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-foreground-secondary">
      {map[provider] ?? provider}
    </span>
  )
}

export function ModelList() {
  const models = getAllModelPricing()
  const [value, setValue] = useState(() => getDefaultModel() ?? models[0].id)

  useEffect(() => {
    const stored = getDefaultModel()
    if (stored && models.some((m) => m.id === stored)) {
      setValue(stored)
    }
  }, [models])

  const handleChange = (modelId: string) => {
    setValue(modelId)
    setDefaultModel(modelId)
  }

  return (
    <div className="space-y-3">
      <RadioGroup value={value} onValueChange={handleChange} aria-label="选择默认模型">
        {models.map((model: ModelPricing) => (
          <div
            key={model.id}
            className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value={model.id} id={model.id} />
              <div>
                <Label htmlFor={model.id} className="text-sm font-medium text-foreground">
                  {model.name}
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <ProviderBadge provider={model.provider} />
                  <span className="text-xs text-foreground-muted">
                    上下文 {model.contextWindow.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <PriceTag label="输入 " value={model.inputPricePer1M} />
              <PriceTag label="输出 " value={model.outputPricePer1M} />
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
