// [Prep-02] AgentHub Pipeline Page
'use client'

import { useState } from 'react'
import {
  Plus,
  Play,
  Save,
  Settings2,
  MessageSquare,
  Search,
  Code,
  FileText,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'

type Node = {
  id: string
  type: 'input' | 'llm' | 'tool' | 'output' | 'condition'
  name: string
  x: number
  y: number
  icon: React.ElementType
}

type Connection = {
  from: string
  to: string
}

const initialNodes: Node[] = [
  { id: 'input-1', type: 'input', name: '用户输入', x: 80, y: 180, icon: MessageSquare },
  { id: 'search-1', type: 'tool', name: 'Web 搜索', x: 300, y: 90, icon: Search },
  { id: 'llm-1', type: 'llm', name: 'Claude 3.5', x: 300, y: 250, icon: Zap },
  { id: 'code-1', type: 'tool', name: '代码执行', x: 520, y: 160, icon: Code },
  { id: 'output-1', type: 'output', name: '最终输出', x: 740, y: 180, icon: FileText },
]

const initialConnections: Connection[] = [
  { from: 'input-1', to: 'search-1' },
  { from: 'input-1', to: 'llm-1' },
  { from: 'search-1', to: 'code-1' },
  { from: 'llm-1', to: 'code-1' },
  { from: 'code-1', to: 'output-1' },
]

const nodeTypeColors: Record<Node['type'], string> = {
  input: 'border-chart-2 bg-chart-2/10',
  llm: 'border-chart-1 bg-chart-1/10',
  tool: 'border-chart-3 bg-chart-3/10',
  output: 'border-chart-4 bg-chart-4/10',
  condition: 'border-chart-5 bg-chart-5/10',
}

export default function PipelinePage() {
  const [nodes] = useState<Node[]>(initialNodes)
  const [connections] = useState<Connection[]>(initialConnections)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    return node ? { x: node.x + 80, y: node.y + 26 } : { x: 0, y: 0 }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        {/* [Prep-02] 修复 #1: 工具栏按钮高度 */}
        <div className="absolute left-1/2 top-16 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 shadow-lg">
          {/* [Prep-02] 修复 #5: 中文按钮文案 */}
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm focus-ring">
            <Plus className="h-3.5 w-3.5" />
            添加节点
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm focus-ring">
            <Play className="h-3.5 w-3.5 text-success" />
            跑一下
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm focus-ring">
            <Save className="h-3.5 w-3.5" />
            存好
          </Button>
        </div>

        {/* Canvas */}
        <div className="relative flex-1 overflow-auto bg-background">
          <svg className="absolute inset-0 h-full w-full">
            {/* Grid Pattern */}
            <defs>
              <pattern
                id="grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="hsl(220, 15%, 22%)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connections */}
            {connections.map((conn) => {
              const from = getNodePosition(conn.from)
              const to = getNodePosition(conn.to)
              const midX = (from.x + to.x) / 2

              return (
                <path
                  key={`${conn.from}-${conn.to}`}
                  d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                  fill="none"
                  stroke="hsl(220, 15%, 30%)"
                  strokeWidth="2"
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              // [Prep-02] 修复 #2: 节点交互态 - border 加深 + focus ring
              // [Prep-02] 修复 #1: 缩小节点尺寸
              className={cn(
                'absolute flex w-[160px] items-center gap-2.5 rounded-lg border-2 bg-card p-2.5 transition-all focus-ring',
                'hover:border-border-strong',
                nodeTypeColors[node.type],
                selectedNode?.id === node.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
              style={{ left: node.x, top: node.y }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background-elevated">
                <node.icon className="h-3.5 w-3.5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-foreground">
                  {node.name}
                </p>
                <p className="text-xs capitalize text-foreground-muted">{node.type}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Properties Panel */}
        {/* [Prep-02] 修复 #1: 缩小属性面板宽度 */}
        <aside className="w-72 shrink-0 border-l border-border bg-card">
          <div className="flex h-11 items-center justify-between border-b border-border px-4">
            <h2 className="text-sm font-semibold text-foreground">属性面板</h2>
            <Settings2 className="h-4 w-4 text-foreground-muted" />
          </div>

          {selectedNode ? (
            <div className="p-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border-2',
                    nodeTypeColors[selectedNode.type]
                  )}
                >
                  <selectedNode.icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedNode.name}
                  </p>
                  <p className="text-xs capitalize text-foreground-muted">
                    {selectedNode.type}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  {/* [Prep-02] 修复 #5: 中文 label */}
                  <Label className="text-sm">节点名称</Label>
                  <Input defaultValue={selectedNode.name} className="h-9 focus-ring" />
                </div>

                {selectedNode.type === 'llm' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm">模型</Label>
                      <Select defaultValue="claude-3.5-sonnet">
                        <SelectTrigger className="h-9 focus-ring">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-3.5-sonnet">
                            Claude 3.5 Sonnet
                          </SelectItem>
                          <SelectItem value="gpt-5">GPT-5</SelectItem>
                          <SelectItem value="gemini-3">Gemini 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">温度</Label>
                      <Input type="number" defaultValue="0.7" step="0.1" min="0" max="2" className="h-9 focus-ring" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">系统提示词</Label>
                      {/* [Prep-02] 修复 #5: 中文 placeholder */}
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-ring resize-none"
                        placeholder="输入系统提示词..."
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === 'tool' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm">工具类型</Label>
                      <Select defaultValue="web-search">
                        <SelectTrigger className="h-9 focus-ring">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web-search">Web 搜索</SelectItem>
                          <SelectItem value="code-exec">代码执行</SelectItem>
                          <SelectItem value="http-request">HTTP 请求</SelectItem>
                          <SelectItem value="file-read">文件读取</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">超时时间 (秒)</Label>
                      <Input type="number" defaultValue="30" className="h-9 focus-ring" />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">描述</Label>
                  {/* [Prep-02] 修复 #5: 中文 placeholder */}
                  <Input placeholder="可选的节点描述..." className="h-9 focus-ring" />
                </div>
              </div>

              <Separator className="my-4" />

              {/* [Prep-02] 修复 #5: 中文按钮文案 */}
              <Button variant="destructive" className="h-9 w-full focus-ring">
                删除节点
              </Button>
            </div>
          ) : (
            // [Prep-02] 修复 #3: 空态
            <div className="flex h-[calc(100%-44px)] flex-col items-center justify-center text-center px-4">
              <Settings2 className="h-7 w-7 text-foreground-muted" />
              {/* [Prep-02] 修复 #5: 中文空态文案 */}
              <p className="mt-3 text-sm text-foreground-secondary">
                点击节点查看属性
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
