{/* [Prep-02] AgentHub Footer Component */}

import Link from 'next/link'
import { footerLinks } from '@/lib/mock-data'

export function Footer() {
  return (
    // [Prep-02] 修复 #1: 压缩间距
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            {/* [Prep-02] 修复 #2: Logo focus 态 */}
            <Link href="/" className="flex items-center gap-2 focus-ring rounded-md w-fit">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-base font-semibold text-foreground">AgentHub</span>
            </Link>
            <p className="mt-3 text-sm text-foreground-secondary">
              AI Agent 商店与 Playground 平台
              <br />
              开发者的得力助手
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {/* [Prep-02] 修复 #2: 链接下划线过渡 */}
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-foreground-secondary hover:text-foreground focus-ring rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-foreground-muted">
            &copy; {new Date().getFullYear()} AgentHub. 保留所有权利。
          </p>
          <div className="flex items-center gap-4">
            {/* [Prep-02] 修复 #2: 链接交互态 */}
            <Link href="#" className="link-underline text-xs text-foreground-muted hover:text-foreground focus-ring rounded-sm">
              服务状态
            </Link>
            <Link href="#" className="link-underline text-xs text-foreground-muted hover:text-foreground focus-ring rounded-sm">
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
