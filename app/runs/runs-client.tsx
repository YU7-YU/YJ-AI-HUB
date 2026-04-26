'use client'

import { useState } from 'react'
import { Run } from '@/shared/schemas/run-history'
import { RunList } from '@/components/run-history/run-list'
import { TraceViewer } from '@/components/run-history/trace-viewer'
import { EmptyState } from '@/components/run-history/empty-state'

type RunsPageClientProps = {
  initialRuns: Run[]
  initialCursor: string | null
  initialHasMore: boolean
  initialModels: string[]
}

export function RunsPageClient({
  initialRuns,
  initialCursor,
  initialHasMore,
  initialModels,
}: RunsPageClientProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left panel: filter + run list */}
      <aside className="w-full overflow-y-auto border-r border-border p-4 md:w-80 lg:w-96">
        <h2 className="mb-3 text-lg font-semibold text-foreground">运行记录</h2>
        <RunList
          initialRuns={initialRuns}
          initialCursor={initialCursor}
          initialHasMore={initialHasMore}
          initialModels={initialModels}
          selectedRunId={selectedRunId}
          onSelectRun={setSelectedRunId}
        />
      </aside>

      {/* Right panel: trace viewer or empty state */}
      <main className="hidden flex-1 overflow-y-auto md:flex">
        {selectedRunId ? (
          <TraceViewer runId={selectedRunId} />
        ) : (
          <div className="flex w-full items-center justify-center p-6">
            <EmptyState type="trace" />
          </div>
        )}
      </main>
    </div>
  )
}
