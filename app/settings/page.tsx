'use client'

import { Header } from '@/components/layout/header'
import { Separator } from '@/components/ui/separator'
import { ModelList } from '@/components/settings/model-list'
import { ApiKeyManager } from '@/components/settings/api-key-manager'
import { ThresholdInput } from '@/components/settings/threshold-input'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 lg:px-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">设置</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              管理模型配置、API Key 和费用预警
            </p>
          </div>

          {/* Section 1: 模型设置 */}
          <section className="mb-8" aria-labelledby="model-settings-heading">
            <h2 id="model-settings-heading" className="text-lg font-semibold text-foreground">模型设置</h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              选择默认模型，用于 Playground 和 Token 预估计算
            </p>
            <Separator className="my-4" />
            <ModelList />
          </section>

          {/* Section 2: API 密钥 */}
          <section className="mb-8" aria-labelledby="api-keys-heading">
            <h2 id="api-keys-heading" className="text-lg font-semibold text-foreground">API 密钥</h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              管理各 provider 的 API Key，编辑后保存即刻生效
            </p>
            <Separator className="my-4" />
            <ApiKeyManager />
          </section>

          {/* Section 3: 预警设置 */}
          <section className="mb-8" aria-labelledby="alert-settings-heading">
            <h2 id="alert-settings-heading" className="text-lg font-semibold text-foreground">预警设置</h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              设置单次请求费用预警阈值，超出时会在 Playground 给出提示
            </p>
            <Separator className="my-4" />
            <ThresholdInput />
          </section>
        </div>
      </main>
    </div>
  )
}
