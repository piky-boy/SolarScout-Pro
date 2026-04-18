import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mapboxGeocode } from '@/lib/mapbox'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') ?? '').trim()
    if (!q) return NextResponse.json({ results: [] })
    const results = await mapboxGeocode(q, 5)
    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('[geocode] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Geocoding failed', results: [] }, { status: 500 })
  }
}
