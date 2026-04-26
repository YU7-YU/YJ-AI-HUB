{/* [Prep-02] AgentHub Pricing Page */}

import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { pricingPlans, faqItems } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const featureComparison = [
  { feature: 'API 调用次数', free: '1,000/月', pro: '10,000/月', team: '无限' },
  { feature: 'Agent 访问', free: '免费 Agent', pro: '全部 Agent', team: '全部 + 优先体验' },
  { feature: 'Playground', free: '基础', pro: '高级', team: '完整' },
  { feature: 'Trace 分析', free: false, pro: true, team: '完整 + 导出' },
  { feature: '运行历史', free: '7 天', pro: '30 天', team: '无限' },
  { feature: 'API 密钥管理', free: false, pro: true, team: true },
  { feature: 'Webhook 集成', free: false, pro: true, team: true },
  { feature: '团队协作', free: false, pro: false, team: true },
  { feature: 'SSO 单点登录', free: false, pro: false, team: true },
  { feature: '自定义 Agent 部署', free: false, pro: false, team: true },
  { feature: 'SLA 保障', free: false, pro: false, team: true },
  { feature: '技术支持', free: '社区', pro: '邮件优先', team: '专属客户经理' },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* [Prep-02] 修复 #1: Header - 压缩间距和字号 */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-xl text-center">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                简单透明的定价
              </h1>
              <p className="mt-3 text-sm text-foreground-secondary">
                选择适合你的方案，随时可以升级或降级
              </p>
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: Pricing Cards - 压缩间距 */}
        <section className="border-b border-border bg-background-subtle">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    // [Prep-02] 修复 #2: Card hover 态 - border 加深
                    'relative flex flex-col rounded-lg border bg-card p-5 transition-colors',
                    plan.highlighted
                      ? 'border-primary'
                      : 'border-border hover:border-border-strong'
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">
                      最受欢迎
                    </Badge>
                  )}

                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-foreground-secondary">
                      {plan.description}
                    </p>

                    {/* [Prep-02] 修复 #1: 价格字号缩小 */}
                    <div className="mt-4">
                      {plan.price === null ? (
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-foreground">
                            免费
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-foreground">
                            ${plan.price}
                          </span>
                          <span className="ml-1 text-sm text-foreground-secondary">
                            /{plan.period}
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span className="text-sm text-foreground-secondary">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* [Prep-02] 修复 #1: 按钮高度 36px */}
                  {/* [Prep-02] 修复 #2: 按钮交互态 */}
                  <Button
                    className={cn(
                      'mt-6 h-9 w-full',
                      plan.highlighted
                        ? 'hover:brightness-105 active:brightness-95'
                        : ''
                    )}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: Feature Comparison Table - 压缩间距 */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
            <h2 className="text-center text-lg font-bold text-foreground">
              功能对比
            </h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-foreground">
                      功能特性
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-foreground">
                      免费版
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-foreground">
                      专业版
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-foreground">
                      团队版
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={cn(
                        'border-b border-border-subtle',
                        i % 2 === 0 && 'bg-background-subtle'
                      )}
                    >
                      <td className="py-3 text-sm text-foreground">
                        {row.feature}
                      </td>
                      <td className="py-3 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <Check className="mx-auto h-4 w-4 text-success" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-foreground-muted" />
                          )
                        ) : (
                          <span className="text-sm text-foreground-secondary">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <Check className="mx-auto h-4 w-4 text-success" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-foreground-muted" />
                          )
                        ) : (
                          <span className="text-sm text-foreground-secondary">
                            {row.pro}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {typeof row.team === 'boolean' ? (
                          row.team ? (
                            <Check className="mx-auto h-4 w-4 text-success" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-foreground-muted" />
                          )
                        ) : (
                          <span className="text-sm text-foreground-secondary">
                            {row.team}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* [Prep-02] 修复 #1: FAQ - 压缩间距 */}
        <section className="bg-background">
          <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8 lg:py-12">
            <h2 className="text-center text-lg font-bold text-foreground">
              常见问题
            </h2>
            <Accordion type="single" collapsible className="mt-8">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground-secondary">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
