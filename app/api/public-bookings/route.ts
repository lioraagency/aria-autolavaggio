import { NextRequest, NextResponse } from 'next/server'
import {
  findCustomerByPhone,
  addCustomer,
  addVehicle,
  addBooking,
  getBookingById,
  VEHICLES,
} from '@/lib/mock-data'
import { SERVICE_PRICES, SERVICE_DURATIONS } from '@/lib/types'
import type { ServiceType, VehicleType } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      serviceType,
      supplements = [],
      totalPrice,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleNotes,
      date,
      time,
      firstName,
      lastName,
      phone,
      email,
      smsOptIn,
      isFirstVisit,
    } = body

    // Validate required fields
    if (!serviceType || !date || !time || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Parse scheduled date
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    const scheduledAt = new Date(year, month - 1, day, hours, minutes, 0, 0)

    // Find or create customer
    let customer = findCustomerByPhone(phone)
    if (!customer) {
      customer = addCustomer({
        firstName,
        lastName,
        phone,
        email: email || undefined,
        vehicles: [],
        totalVisits: 0,
        totalSpent: 0,
        createdAt: new Date(),
        notes: isFirstVisit ? 'Première visite' : undefined,
      })
    }

    // Create vehicle
    const vehicle = addVehicle({
      make: vehicleMake,
      model: vehicleModel,
      year: Number(vehicleYear),
      color: vehicleColor,
      type: (vehicleType as VehicleType) || 'sedan',
      notes: vehicleNotes || undefined,
    })

    // Link vehicle to customer
    customer.vehicles.push(vehicle)

    // Build notes from supplements
    const supplementLabels: Record<string, string> = {
      calcium: 'Traitement calcium',
      moteur: 'Shampoing moteur',
    }
    const supplementNotes = supplements.length > 0
      ? `Suppléments: ${supplements.map((s: string) => supplementLabels[s] ?? s).join(', ')}`
      : undefined

    // Create booking
    const booking = addBooking({
      customerId: customer.id,
      vehicleId: vehicle.id,
      serviceType: serviceType as ServiceType,
      scheduledAt,
      estimatedDuration: SERVICE_DURATIONS[serviceType as ServiceType] ?? 60,
      operationalStatus: 'scheduled',
      paymentStatus: 'unpaid',
      price: totalPrice ?? SERVICE_PRICES[serviceType as ServiceType],
      notes: supplementNotes,
      beforePhotos: [],
      afterPhotos: [],
    })

    // Update customer stats
    customer.totalVisits += 1
    customer.totalSpent += booking.price

    // Format booking number for display
    const bookingNumber = `B-${booking.id.replace('b', '').padStart(3, '0')}`

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber,
      customerId: customer.id,
      vehicleId: vehicle.id,
    })
  } catch (error) {
    console.error('[public-bookings] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }

  const booking = getBookingById(id)
  if (!booking) {
    return NextResponse.json({ success: false, error: 'Réservation introuvable' }, { status: 404 })
  }

  const bookingNumber = `B-${booking.id.replace('b', '').padStart(3, '0')}`

  return NextResponse.json({
    success: true,
    booking: {
      id: booking.id,
      bookingNumber,
      serviceType: booking.serviceType,
      scheduledAt: booking.scheduledAt.toISOString(),
      price: booking.price,
      notes: booking.notes,
      operationalStatus: booking.operationalStatus,
    },
  })
}
