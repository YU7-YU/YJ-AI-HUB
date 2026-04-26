// [Prep-02] AgentHub Header Component
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '商店', href: '/gallery' },
  { label: '运行记录', href: '/runs' },
  { label: '编排', href: '/pipeline' },
  { label: 'Playground', href: '/playground' },
  { label: '定价', href: '/pricing' },
]

export function Header() {
  const pathname = usePathname()

  return (
    // [Prep-02] 修复 #1: 缩小 Header 高度
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        {/* [Prep-02] 修复 #2: Logo focus 态 */}
        <Link href="/" className="flex items-center gap-2 focus-ring rounded-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">YJ</span>
          </div>
          <span className="text-base font-semibold text-foreground">AgentHub</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // [Prep-02] 修复 #2: 导航链接交互态
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-ring',
                pathname === item.href
                  ? 'bg-accent text-foreground'
                  : 'text-foreground-secondary hover:bg-accent hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/settings" className="hidden md:block">
            {/* [Prep-02] 修复 #1: 按钮高度 */}
            {/* [Prep-02] 修复 #2: 按钮交互态 */}
            <Button variant="ghost" size="sm" className="h-8 text-sm text-foreground-secondary hover:text-foreground focus-ring">
              设置
            </Button>
          </Link>
          {/* [Prep-02] 修复 #5: 中文按钮文案 */}
          <Button size="sm" className="h-8 text-sm focus-ring">登录</Button>
        </div>
      </div>
    </header>
  )
}
