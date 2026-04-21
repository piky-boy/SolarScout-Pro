import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Lightweight endpoint that returns the Google Maps API key for client-side
 * map rendering. Only accessible to authenticated users.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ key: process.env.GOOGLE_MAPS_API_KEY ?? '' })
}
