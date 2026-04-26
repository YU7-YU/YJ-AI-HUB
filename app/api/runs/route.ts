import { NextRequest, NextResponse } from 'next/server'
import { getRunsList, getDistinctModels } from '@/lib/run-history/repository'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const status = (searchParams.get('status') as 'all' | 'success' | 'error') ?? 'all'
    const modelId = searchParams.get('modelId') ?? null
    const timeRange = (searchParams.get('timeRange') as '1h' | '24h' | '7d' | 'custom') ?? '24h'

    // Validate
    if (!['all', 'success', 'error'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
    }
    if (!['1h', '24h', '7d', 'custom'].includes(timeRange)) {
      return NextResponse.json({ error: 'Invalid time range' }, { status: 400 })
    }
    if (limit < 1 || limit > 50) {
      return NextResponse.json({ error: 'Limit must be between 1 and 50' }, { status: 400 })
    }

    const result = await getRunsList({
      cursor,
      limit: isNaN(limit) ? 50 : limit,
      status,
      modelId,
      timeRange,
      customFrom: null,
      customTo: null,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[Runs API] Error fetching runs list:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 })
  }
}
