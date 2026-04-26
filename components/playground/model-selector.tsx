'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ModelOption = {
  id: string
  name: string
}

type ModelSelectorProps = {
  models: ModelOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function ModelSelector({
  models,
  value,
  onChange,
  disabled = false,
  className,
}: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="选择模型" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
