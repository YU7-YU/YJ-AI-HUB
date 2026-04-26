// [Prep-02] AgentHub Gallery Page
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, Telescope, X as XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AgentCard } from '@/components/agent-card'
import { SkeletonCard } from '@/components/skeleton-card'
import { allAgents, categories, providers, capabilities } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 12

export default function GalleryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  // [Prep-02] 修复 #3: 加载态模拟
  const [isLoading, setIsLoading] = useState(false)

  const filteredAgents = useMemo(() => {
    return allAgents.filter((agent) => {
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          agent.name.toLowerCase().includes(searchLower) ||
          agent.description.toLowerCase().includes(searchLower) ||
          agent.author.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(agent.category)) {
        return false
      }

      if (selectedProviders.length > 0 && !selectedProviders.includes(agent.provider)) {
        return false
      }

      if (selectedCapabilities.length > 0) {
        const hasCapability = selectedCapabilities.some((cap) =>
          agent.capabilities.includes(cap)
        )
        if (!hasCapability) return false
      }

      return true
    })
  }, [search, selectedCategories, selectedProviders, selectedCapabilities])

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const hasFilters = selectedCategories.length > 0 || selectedProviders.length > 0 || selectedCapabilities.length > 0 || search

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
    setCurrentPage(1)
  }

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    )
    setCurrentPage(1)
  }

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability]
    )
    setCurrentPage(1)
  }

  // [Prep-02] 修复 #3: 清除筛选
  const clearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedProviders([])
    setSelectedCapabilities([])
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* [Prep-02] 修复 #1: Search Bar - 压缩间距 */}
        <section className="border-b border-border bg-background-subtle">
          <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  type="text"
                  // [Prep-02] 修复 #5: 中文 placeholder
                  placeholder="搜索 Agent 名称、能力、作者…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  // [Prep-02] 修复 #1: 输入框高度 40px
                  // [Prep-02] 修复 #2: focus 态
                  className="h-10 pl-10 text-sm focus-ring"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            {/* [Prep-02] 修复 #4: md 断点响应式 - 筛选栏在 md 下折叠 */}
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Filter Sidebar */}
              <aside className="w-full shrink-0 lg:w-56">
                <div className="space-y-5">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">分类</h3>
                    <div className="mt-2.5 space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center gap-2">
                          {/* [Prep-02] 修复 #2: Checkbox focus 态 */}
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                            className="focus-ring"
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="cursor-pointer text-sm text-foreground-secondary"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Providers */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">提供商</h3>
                    <div className="mt-2.5 space-y-2">
                      {providers.map((provider) => (
                        <div key={provider} className="flex items-center gap-2">
                          <Checkbox
                            id={`provider-${provider}`}
                            checked={selectedProviders.includes(provider)}
                            onCheckedChange={() => toggleProvider(provider)}
                            className="focus-ring"
                          />
                          <Label
                            htmlFor={`provider-${provider}`}
                            className="cursor-pointer text-sm text-foreground-secondary"
                          >
                            {provider}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">能力</h3>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {capabilities.map((cap) => (
                        <button
                          key={cap}
                          onClick={() => toggleCapability(cap)}
                          // [Prep-02] 修复 #2: 标签交互态
                          className={cn(
                            'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-ring',
                            selectedCapabilities.includes(cap)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-foreground-secondary hover:border-border-strong'
                          )}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Agent Grid */}
              <div className="flex-1">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-foreground-secondary">
                    共 {filteredAgents.length} 个 Agent
                  </p>
                </div>

                {/* [Prep-02] 修复 #3: 加载态 - 骨架屏 6 张卡片 */}
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : paginatedAgents.length > 0 ? (
                  // [Prep-02] 修复 #4: md 2列 lg 3列
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {paginatedAgents.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                ) : (
                  // [Prep-02] 修复 #3: 空态 - 望远镜 SVG + 清除筛选 CTA
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background-elevated">
                      {/* [Prep-02] 修复 #3: SVG 线条风格望远镜 */}
                      <svg
                        className="h-8 w-8 text-foreground-muted"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                        <path d="M11 8v6" />
                        <path d="M8 11h6" />
                      </svg>
                    </div>
                    {/* [Prep-02] 修复 #5: 中文空态文案 */}
                    <h3 className="mt-4 text-base font-medium text-foreground">
                      没找到匹配的 Agent
                    </h3>
                    <p className="mt-1 text-sm text-foreground-secondary">
                      试试调整筛选条件？
                    </p>
                    {hasFilters && (
                      <Button
                        variant="outline"
                        className="mt-4 h-8 gap-1.5 text-sm"
                        onClick={clearFilters}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                        清除筛选
                      </Button>
                    )}
                  </div>
                )}

                {/* [Prep-02] 修复 #2: 分页器交互态 */}
                {totalPages > 1 && !isLoading && (
                  <div className="mt-6 flex items-center justify-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 focus-ring disabled:interactive-disabled"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8 focus-ring"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 focus-ring disabled:interactive-disabled"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
