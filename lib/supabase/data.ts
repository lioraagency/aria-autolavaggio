/**
 * Server-only data layer for the ARIA cockpit.
 * Tries Supabase when env vars are configured; falls back to mock-data.
 * Never import from client components.
 */

import type { Booking, Customer, Vehicle, ServiceType, VehicleType, OperationalStatus, PaymentStatus } from '@/lib/types'
import { BOOKINGS, CUSTOMERS, VEHICLES, getCustomer, getVehicle, getTodayBookings } from '@/lib/mock-data'

export type CockpitData = {
  bookings:    Booking[]
  customerMap: Record<string, Customer>
  vehicleMap:  Record<string, Vehicle>
}

// ── Row mapping ──────────────────────────────────────────────────────────────

type ReservationRow = Record<string, unknown> & {
  customers?: Record<string, unknown> | null
}

function rowToBookingAndVehicle(row: ReservationRow): { booking: Booking; vehicle: Vehicle } {
  const vehicleId = `${row.id}_v`

  const booking: Booking = {
    id:                 row.id as string,
    customerId:         row.customer_id as string,
    vehicleId,
    serviceType:        row.service_type as ServiceType,
    scheduledAt:        new Date(row.scheduled_at as string),
    estimatedDuration:  (row.estimated_duration_minutes as number) ?? 60,
    operationalStatus:  (row.operational_status as OperationalStatus) ?? 'scheduled',
    paymentStatus:      (row.payment_status as PaymentStatus) ?? 'unpaid',
    price:              (row.price_cents as number) ?? 0,
    notes:              (row.notes as string | null) ?? undefined,
    beforePhotos:       [],
    afterPhotos:        [],
    arrivedAt:   row.arrived_at   ? new Date(row.arrived_at   as string) : undefined,
    startedAt:   row.started_at   ? new Date(row.started_at   as string) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at as string) : undefined,
    pickedUpAt:  row.picked_up_at ? new Date(row.picked_up_at as string) : undefined,
  }

  const vehicle: Vehicle = {
    id:    vehicleId,
    make:  (row.vehicle_make  as string) ?? '',
    model: (row.vehicle_model as string) ?? '',
    year:  (row.vehicle_year  as number) ?? 2020,
    color: (row.vehicle_color as string) ?? '',
    type:  (row.vehicle_type  as VehicleType) ?? 'sedan',
    notes: (row.vehicle_notes as string | null) ?? undefined,
  }

  return { booking, vehicle }
}

function rowToCustomer(row: ReservationRow): Customer | null {
  const c = row.customers
  if (!c) return null
  return {
    id:            c.id as string,
    firstName:     c.first_name as string,
    lastName:      c.last_name as string,
    phone:         c.phone as string,
    email:         (c.email as string | null) ?? undefined,
    vehicles:      [],
    totalVisits:   (c.total_visits as number) ?? 0,
    totalSpent:    (c.total_spent_cents as number) ?? 0,
    notes:         (c.notes as string | null) ?? undefined,
    createdAt:     c.created_at ? new Date(c.created_at as string) : new Date(),
  }
}

// ── Mock-data fallback ───────────────────────────────────────────────────────

function mockData(filter: 'today' | 'all'): CockpitData {
  const bookings = filter === 'today' ? getTodayBookings() : BOOKINGS

  const customerMap: Record<string, Customer> = {}
  const vehicleMap:  Record<string, Vehicle>  = {}

  bookings.forEach(b => {
    const c = getCustomer(b.customerId)
    const v = getVehicle(b.vehicleId)
    if (c) customerMap[c.id] = c
    if (v) vehicleMap[v.id]  = v
  })

  return { bookings, customerMap, vehicleMap }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getCockpitData(filter: 'today' | 'all'): Promise<CockpitData> {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !serviceKey) {
    return mockData(filter)
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    let query = supabase
      .from('reservations')
      .select(`
        *,
        customers (
          id, first_name, last_name, phone, email,
          total_visits, total_spent_cents, notes, created_at
        )
      `)
      .order('scheduled_at', { ascending: true })

    if (filter === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const tomorrowStart = new Date(todayStart.getTime() + 86_400_000)
      query = query
        .gte('scheduled_at', todayStart.toISOString())
        .lt('scheduled_at', tomorrowStart.toISOString())
    } else {
      // All bookings from yesterday onward (for agenda)
      const cutoff = new Date()
      cutoff.setHours(0, 0, 0, 0)
      cutoff.setDate(cutoff.getDate() - 1)
      query = query.gte('scheduled_at', cutoff.toISOString())
    }

    const { data, error } = await query

    if (error || !data) {
      console.error('[getCockpitData] Supabase error:', error)
      return mockData(filter)
    }

    const bookings:    Booking[]                 = []
    const customerMap: Record<string, Customer>  = {}
    const vehicleMap:  Record<string, Vehicle>   = {}

    for (const row of data as ReservationRow[]) {
      const { booking, vehicle } = rowToBookingAndVehicle(row)
      const customer = rowToCustomer(row)

      bookings.push(booking)
      vehicleMap[vehicle.id] = vehicle
      if (customer) customerMap[customer.id] = customer
    }

    // If Supabase returned nothing, fall through to mock (dev / empty DB)
    if (bookings.length === 0) return mockData(filter)

    return { bookings, customerMap, vehicleMap }
  } catch (e) {
    console.error('[getCockpitData] error:', e)
    return mockData(filter)
  }
}

export function computeTodayStats(bookings: Booking[]) {
  const active    = bookings.filter(b => ['in_progress', 'drying', 'quality_check'].includes(b.operationalStatus))
  const ready     = bookings.filter(b => b.operationalStatus === 'ready')
  const scheduled = bookings.filter(b => b.operationalStatus === 'scheduled')
  const revenue   = bookings
    .filter(b => ['paid', 'pending'].includes(b.paymentStatus) && !['cancelled', 'no_show'].includes(b.operationalStatus))
    .reduce((s, b) => s + b.price, 0)
  const estimated = bookings
    .filter(b => !['cancelled', 'no_show'].includes(b.operationalStatus))
    .reduce((s, b) => s + b.price, 0)
  const next = [...scheduled].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0]
  return { active, ready, revenue, estimated, scheduled, next }
}
