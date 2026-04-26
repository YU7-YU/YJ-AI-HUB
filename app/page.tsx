{/* [Prep-02] AgentHub Landing Page */}

import Link from 'next/link'
import { Sparkles, Calculator, Activity, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AgentCard } from '@/components/agent-card'
import { ParticleBackground } from '@/components/particle-background'
import { featuredAgents, stats, valueProps } from '@/lib/mock-data'

const iconMap: Record<string, React.ReactNode> = {
  // [Prep-02] 修复 #1: 缩小图标尺寸
  Sparkles: <Sparkles className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* [Prep-02] 修复 #1: Hero Section - 压缩高度至 60vh 以下，字号缩小 */}
        {/* [Prep-02] 修复 #4: md 断点响应式 */}
        <section className="relative overflow-hidden border-b border-border">
          <ParticleBackground />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                一站式 AI Agent
                <br />
                发现、试用、集成
              </h1>
              <p className="mt-4 text-pretty text-sm text-foreground-secondary sm:text-base">
                AgentHub 是专为开发者打造的 AI Agent 商店与 Playground 平台。
                浏览 500+ 个精选 Agent，在线试用，一键集成到你的应用。
              </p>
              {/* [Prep-02] 修复 #1: 按钮高度 36-40px */}
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/gallery">
                  <Button className="h-9 gap-2">
                    浏览 Agent 商店
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline" className="h-9">
                    打开 Playground
                  </Button>
                </Link>
              </div>
              <p className="mt-3 text-xs text-foreground-muted">
                在线演示，无需注册
              </p>
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: Featured Agents - 压缩间距 */}
        <section className="border-b border-border bg-background-subtle">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">精选 Agent</h2>
              {/* [Prep-02] 修复 #2: 链接下划线过渡 */}
              <Link
                href="/gallery"
                className="link-underline flex items-center gap-1 text-sm font-medium text-primary"
              >
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* [Prep-02] 修复 #1: 1920x1080 一屏至少 6 张卡片 */}
            {/* [Prep-02] 修复 #4: md 2列 lg 3列 */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: Value Props - 压缩间距和字号 */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
            <h2 className="text-center text-lg font-bold text-foreground">
              为什么选择 AgentHub
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {valueProps.map((prop) => (
                <div
                  key={prop.title}
                  className="flex flex-col items-center text-center md:items-start md:text-left"
                >
                  {/* [Prep-02] 修复 #1: 缩小图标容器 */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {iconMap[prop.icon]}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {prop.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-foreground-secondary">
                    {prop.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: Stats Row - 压缩间距和字号 */}
        <section className="border-b border-border bg-background-subtle">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-foreground lg:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-secondary">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: CTA Section - 压缩间距和字号 */}
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-lg font-bold text-foreground">
                准备好开始了吗？
              </h2>
              <p className="mt-3 text-sm text-foreground-secondary">
                免费注册，立即体验 500+ 个 AI Agent 的强大能力。
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/gallery">
                  <Button className="h-9">免费试用</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="h-9">
                    查看定价
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
