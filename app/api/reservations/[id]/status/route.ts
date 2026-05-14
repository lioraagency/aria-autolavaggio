import { NextRequest, NextResponse } from 'next/server'
import type { OperationalStatus } from '@/lib/types'
import { OPERATIONAL_PIPELINE } from '@/lib/types'
import { BOOKINGS } from '@/lib/mock-data'

const VALID_STATUSES = new Set<string>([
  'scheduled', 'arrived', 'in_progress', 'drying', 'quality_check', 'ready', 'picked_up', 'cancelled', 'no_show',
])

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 })
  }

  const status = body.status as string | undefined
  if (!status || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ success: false, error: 'Statut invalide' }, { status: 400 })
  }

  // Try Supabase first if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (supabaseUrl && serviceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const now = new Date().toISOString()
      const updates: Record<string, unknown> = {
        operational_status: status,
        updated_at: now,
      }
      if (status === 'arrived')       updates.arrived_at = now
      if (status === 'in_progress')   updates.started_at = now
      if (status === 'ready')         updates.completed_at = now
      if (status === 'picked_up') {   updates.picked_up_at = now; updates.payment_status = 'paid' }

      const { error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('[status] supabase update:', error)
        return NextResponse.json({ success: false, error: 'Impossible de mettre à jour le statut.' }, { status: 502 })
      }

      return NextResponse.json({ success: true, status })
    } catch (e) {
      console.error('[status] supabase error:', e)
      // fall through to mock-data
    }
  }

  // Fallback: update in-memory mock-data
  const booking = BOOKINGS.find(b => b.id === id)
  if (!booking) {
    return NextResponse.json({ success: false, error: 'Réservation introuvable' }, { status: 404 })
  }

  booking.operationalStatus = status as OperationalStatus
  const now = new Date()
  if (status === 'arrived')     booking.arrivedAt   = now
  if (status === 'in_progress') booking.startedAt   = now
  if (status === 'ready')       booking.completedAt = now
  if (status === 'picked_up') { booking.pickedUpAt  = now; booking.paymentStatus = 'paid' }

  return NextResponse.json({ success: true, status })
}
