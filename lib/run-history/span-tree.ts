import { FlatSpan, SpanNode } from '@/shared/schemas/run-history'

/**
 * 将数据库返回的扁平 spans 列表重建树为嵌套结构
 *
 * 算法：
 * 1. 按 id 建立 Map<id, SpanNode>
 * 2. 遍历 spans，将每个子节点挂到父节点的 children 中
 * 3. 返回所有 parentSpanId === null 的根节点
 */
export function buildSpanTree(flatSpans: FlatSpan[]): SpanNode[] {
  const nodeMap = new Map<string, SpanNode>()

  // Step 1: 创建所有节点
  for (const span of flatSpans) {
    nodeMap.set(span.id, { ...span, children: [] })
  }

  const roots: SpanNode[] = []

  // Step 2: 建立父子关系
  for (const span of flatSpans) {
    const node = nodeMap.get(span.id)!
    if (!span.parentSpanId) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(span.parentSpanId)
      if (parent) {
        parent.children.push(node)
      } else {
        // 孤儿 span（父节点不存在），提升为根
        roots.push(node)
      }
    }
  }

  // Step 3: 按 startTime 排序
  return sortTreeByTime(roots)
}

/**
 * 递归排序：每个节点的 children 按 startTime 升序
 */
function sortTreeByTime(nodes: SpanNode[]): SpanNode[] {
  for (const node of nodes) {
    if (node.children.length > 0) {
      node.children = sortTreeByTime(node.children)
    }
  }
  return nodes.sort((a, b) => a.startTime - b.startTime)
}

/**
 * 计算瀑布图的总时间范围
 */
export function getTraceTimeRange(spans: FlatSpan[]): { min: number; max: number; total: number } {
  if (spans.length === 0) return { min: 0, max: 0, total: 0 }
  const min = Math.min(...spans.map((s) => s.startTime))
  const max = Math.max(...spans.map((s) => s.endTime))
  return { min, max, total: max - min }
}

/**
 * 根据耗时计算色阶颜色
 * <200ms: 绿 / 200-1000ms: 黄 / >1000ms: 红
 * 返回 Tailwind class 名称
 */
export function getDurationColorClass(duration: number): string {
  if (duration < 200) return 'text-success'
  if (duration <= 1000) return 'text-warning'
  return 'text-destructive'
}
