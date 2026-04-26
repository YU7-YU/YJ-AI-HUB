import { NextRequest, NextResponse } from 'next/server'
import { getRunDetail } from '@/lib/run-history/repository'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const detail = await getRunDetail(id)

    if (!detail) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      run: detail.run,
      flatSpans: detail.flatSpans,
    })
  } catch (err) {
    console.error('[Runs API] Error fetching run detail:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch run detail' }, { status: 500 })
  }
}
