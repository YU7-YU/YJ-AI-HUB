'use client'

import { useState } from 'react'
import { Eye, EyeOff, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { maskApiKey } from '@/lib/utils/mask'
import { getApiKeys, setApiKey, removeApiKey } from '@/lib/settings/storage'

type Provider = {
  id: string
  label: string
}

const PROVIDERS: Provider[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'deepseek', label: 'DeepSeek' },
]

function ApiKeyRow({
  provider,
  storedKey,
  onSaved,
  onRemoved,
}: {
  provider: Provider
  storedKey: string
  onSaved: () => void
  onRemoved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    if (inputValue.trim()) {
      setApiKey(provider.id, inputValue.trim())
      setEditing(false)
      setShowRaw(false)
      onSaved()
    }
  }

  const handleDelete = () => {
    removeApiKey(provider.id)
    setConfirmDelete(false)
    onRemoved()
  }

  const masked = maskApiKey(storedKey)
  const displayText = showRaw ? storedKey : masked

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-border-strong">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{provider.label}</p>
          {storedKey ? (
            <div className="mt-1 flex items-center gap-2">
              <code className="text-xs font-mono text-foreground-secondary">{displayText}</code>
              <button
                type="button"
                onClick={() => setShowRaw(!showRaw)}
                className="text-foreground-muted transition-colors hover:text-foreground"
                aria-label={showRaw ? '隐藏 API Key' : '显示 API Key'}
              >
                {showRaw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <p className="mt-1 text-xs text-foreground-muted">尚未配置</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {storedKey ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={`编辑 ${provider.label} API Key`}
                onClick={() => {
                  setEditing(true)
                  setInputValue(storedKey)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label={`删除 ${provider.label} API Key`}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setEditing(true)
                setInputValue('')
              }}
            >
              <Plus className="h-3 w-3" />
              配置
            </Button>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      {editing && (
        <div className="flex items-center gap-2 rounded-lg border border-border p-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`输入 ${provider.label} 的 API Key...`}
            aria-label={`${provider.label} API Key 输入框`}
            className="h-8 flex-1 font-mono text-xs"
            autoFocus
          />
          <Button size="sm" className="h-8" onClick={handleSave} disabled={!inputValue.trim()}>
            保存
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              setEditing(false)
              setInputValue('')
            }}
          >
            取消
          </Button>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 {provider.label} 的 API Key 吗？删除后该 provider 将不可用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<Record<string, string>>(getApiKeys)

  const handleRefresh = () => setKeys(getApiKeys())

  return (
    <div className="space-y-2">
      {PROVIDERS.map((p) => (
        <ApiKeyRow
          key={p.id}
          provider={p}
          storedKey={keys[p.id] || ''}
          onSaved={handleRefresh}
          onRemoved={handleRefresh}
        />
      ))}
    </div>
  )
}
