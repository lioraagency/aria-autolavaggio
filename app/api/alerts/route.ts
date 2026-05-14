import { NextRequest, NextResponse } from 'next/server'
import { getAlerts, markAllRead, markAlertRead } from '@/lib/store'

export async function GET() {
  const alerts = getAlerts()

  const payload = alerts.map(a => ({
    id: a.id,
    type: a.type,
    title: a.title,
    body: a.body,
    isRead: a.isRead,
    reservationId: a.reservationId ?? null,
    createdAt: a.createdAt.toISOString(),
  }))

  return NextResponse.json({ success: true, alerts: payload })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>

  if (body.action === 'markAllRead') {
    markAllRead()
    return NextResponse.json({ success: true })
  }

  if (body.action === 'markRead' && typeof body.id === 'string') {
    markAlertRead(body.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 })
}
