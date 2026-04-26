// [Prep-02] AgentHub Agent Detail + Playground Page
'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Star,
  Send,
  Plus,
  Settings2,
  Coins,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AgentCard } from '@/components/agent-card'
import { allAgents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const models = [
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google' },
  { id: 'llama-4-70b', name: 'Llama 4 70B', provider: 'Meta' },
]

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const agent = allAgents.find((a) => a.id === id) || allAgents[0]

  const [selectedModel, setSelectedModel] = useState(models[0].id)
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([2048])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tokenCount, setTokenCount] = useState({ input: 0, output: 0 })

  const similarAgents = allAgents
    .filter((a) => a.category === agent.category && a.id !== agent.id)
    .slice(0, 4)

  const handleSend = () => {
    if (!input.trim()) return

    setIsLoading(true)
    setOutput(null)
    setTokenCount({ input: Math.ceil(input.length / 4), output: 0 })

    setTimeout(() => {
      const response = `收到你的请求：「${input.slice(0, 50)}${input.length > 50 ? '...' : ''}」

正在处理中...

**分析结果：**

1. 你的输入已被成功解析
2. Agent 正在调用相关工具
3. 结果已生成

这是一个模拟的响应示例，实际使用时会连接到真实的 AI 模型后端。`

      setOutput(response)
      setTokenCount({ input: Math.ceil(input.length / 4), output: Math.ceil(response.length / 4) })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* [Prep-02] 修复 #2: Breadcrumb 链接下划线过渡 */}
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-2.5 lg:px-8">
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/gallery"
                className="link-underline text-foreground-muted hover:text-foreground"
              >
                商店
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
              <Link
                href="/gallery"
                className="link-underline text-foreground-muted hover:text-foreground"
              >
                {agent.category}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
              <span className="text-foreground">{agent.name}</span>
            </nav>
          </div>
        </div>

        {/* [Prep-02] 修复 #4: md 断点响应式 - 左右变上下 */}
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Agent Info - Left 40% on lg, full width on md */}
            <div className="w-full shrink-0 lg:w-[38%]">
              {/* [Prep-02] 修复 #2: Card hover 态 */}
              <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong">
                {/* Avatar & Name */}
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-background-elevated text-xl font-bold text-foreground">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* [Prep-02] 修复 #1: 字号缩小 */}
                    <h1 className="text-lg font-bold text-foreground">
                      {agent.name}
                    </h1>
                    <p className="mt-0.5 text-sm text-foreground-secondary">
                      由 {agent.author} 提供
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-foreground">{agent.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-foreground-muted">
                        {agent.runs >= 1000
                          ? `${(agent.runs / 1000).toFixed(0)}k`
                          : agent.runs}{' '}
                        次运行
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-5 flex items-center justify-between rounded-lg bg-background-subtle p-3">
                  <span className="text-sm text-foreground-secondary">价格</span>
                  <span className="text-base font-semibold text-foreground">
                    {agent.price === null ? '免费' : `$${agent.price}/月`}
                  </span>
                </div>

                {/* Capabilities */}
                <div className="mt-5">
                  <h3 className="text-sm font-medium text-foreground">能力标签</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">{agent.provider}</Badge>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-5">
                  <h3 className="text-sm font-medium text-foreground">简介</h3>
                  <p className="mt-1.5 text-sm text-foreground-secondary">
                    {agent.description}
                  </p>
                </div>

                {/* [Prep-02] 修复 #1: 按钮高度 36px */}
                {/* [Prep-02] 修复 #2: 按钮交互态 */}
                <Button className="mt-5 h-9 w-full gap-2 focus-ring">
                  <Plus className="h-4 w-4" />
                  添加到我的 Agent
                </Button>
              </div>
            </div>

            {/* Playground - Right 60% on lg, full width on md */}
            <div className="flex-1">
              <div className="rounded-lg border border-border bg-card">
                {/* Playground Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <h2 className="text-sm font-semibold text-foreground">
                    Playground
                  </h2>
                  <Button variant="ghost" size="icon" className="h-7 w-7 focus-ring">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Model & Parameters */}
                <div className="border-b border-border bg-background-subtle p-3">
                  {/* [Prep-02] 修复 #4: md 断点 - 参数区响应式 */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Model Select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground-muted">模型</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="h-8 text-sm focus-ring">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-foreground-muted">温度</Label>
                        <span className="text-xs text-foreground-secondary">
                          {temperature[0].toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={temperature}
                        onValueChange={setTemperature}
                        min={0}
                        max={2}
                        step={0.1}
                        className="mt-1.5"
                      />
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-foreground-muted">最大输出</Label>
                        <span className="text-xs text-foreground-secondary">
                          {maxTokens[0]}
                        </span>
                      </div>
                      <Slider
                        value={maxTokens}
                        onValueChange={setMaxTokens}
                        min={256}
                        max={8192}
                        step={256}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4">
                  {/* [Prep-02] 修复 #5: 中文 placeholder */}
                  <Textarea
                    placeholder="输入你想让 Agent 做的事…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[100px] resize-none text-sm focus-ring"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSend()
                      }
                    }}
                  />
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">
                      Ctrl/Cmd + Enter 发送
                    </span>
                    {/* [Prep-02] 修复 #1: 按钮高度 36px */}
                    {/* [Prep-02] 修复 #2: 按钮 disabled 态 */}
                    {/* [Prep-02] 修复 #5: 中文按钮文案 */}
                    <Button
                      className="h-9 focus-ring disabled:interactive-disabled"
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                    >
                      {isLoading ? '处理中…' : '发送'}
                      {!isLoading && <Send className="ml-1.5 h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Output */}
                <div className="border-t border-border p-4">
                  <div
                    className={cn(
                      'min-h-[160px] rounded-lg border border-border-subtle bg-background-subtle p-4',
                      !output && !isLoading && 'flex items-center justify-center'
                    )}
                  >
                    {/* [Prep-02] 修复 #3: 加载态 - 三点跳动 + 思考中 */}
                    {isLoading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                          <span>思考中</span>
                          <span className="loading-dots flex gap-0.5">
                            <span className="inline-block h-1 w-1 rounded-full bg-foreground-muted" />
                            <span className="inline-block h-1 w-1 rounded-full bg-foreground-muted" />
                            <span className="inline-block h-1 w-1 rounded-full bg-foreground-muted" />
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-3/4" />
                          <div className="skeleton h-4 w-1/2" />
                          <div className="skeleton h-4 w-5/6" />
                        </div>
                      </div>
                    ) : output ? (
                      <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                        {output}
                      </pre>
                    ) : (
                      // [Prep-02] 修复 #3: 初始空态 - 浅色提示文字
                      // [Prep-02] 修复 #5: 中文空态文案
                      <p className="text-sm text-foreground-muted">
                        试着问点什么…
                      </p>
                    )}
                  </div>
                </div>

                {/* Token Counter */}
                <div className="flex items-center justify-between border-t border-border bg-background-subtle px-4 py-2.5">
                  <div className="flex items-center gap-3 text-xs text-foreground-secondary">
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      输入: {tokenCount.input} tokens
                    </span>
                    <span>输出: {tokenCount.output} tokens</span>
                  </div>
                  <span className="text-xs text-foreground-muted">
                    预估费用: ${((tokenCount.input + tokenCount.output) * 0.00001).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Agents */}
          {similarAgents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-foreground">相似 Agent</h2>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-3">
                {similarAgents.map((a) => (
                  <div key={a.id} className="w-[280px] shrink-0">
                    <AgentCard agent={a} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
