import { getRunsList, getDistinctModels } from '@/lib/run-history/repository'
import { RunsPageClient } from './runs-client'

export const dynamic = 'force-dynamic'

export default async function RunsPage() {
  const [initialData, models] = await Promise.all([
    getRunsList({
      cursor: null,
      limit: 50,
      status: 'all',
      modelId: null,
      timeRange: '24h',
      customFrom: null,
      customTo: null,
    }),
    getDistinctModels(),
  ])

  return (
    <RunsPageClient
      initialRuns={initialData.runs}
      initialCursor={initialData.nextCursor}
      initialHasMore={initialData.hasMore}
      initialModels={models}
    />
  )
}
