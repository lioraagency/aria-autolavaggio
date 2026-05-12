import type { Customer, Vehicle, Booking, ServiceType, VehicleType, OperationalStatus, PaymentStatus } from './types'
import { SERVICE_PRICES, SERVICE_DURATIONS } from './types'

// ── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number, h = 10, m = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(h, m, 0, 0)
  return d
}
function today(h: number, m = 0): Date {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}
function daysAhead(n: number, h = 10, m = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(h, m, 0, 0)
  return d
}

// ── Vehicles ───────────────────────────────────────────────────────────────

export const VEHICLES: Vehicle[] = [
  { id: 'v01', make: 'Toyota',  model: 'Camry',     year: 2019, color: 'Bleu marin',   plate: 'ABC-123', type: 'sedan' },
  { id: 'v02', make: 'Honda',   model: 'Civic',     year: 2021, color: 'Noir brillant',plate: 'XYZ-456', type: 'sedan' },
  { id: 'v03', make: 'Ford',    model: 'F-150',     year: 2020, color: 'Gris ardoise', plate: 'LMN-789', type: 'truck', notes: 'Boue dans benne' },
  { id: 'v04', make: 'Hyundai', model: 'Tucson',    year: 2022, color: 'Blanc nacré',  plate: 'DEF-321', type: 'suv' },
  { id: 'v05', make: 'Subaru',  model: 'Impreza',   year: 2018, color: 'Rouge métallique', plate: 'GHI-654', type: 'compact' },
  { id: 'v06', make: 'Mazda',   model: 'CX-5',      year: 2023, color: 'Argent platine', plate: 'JKL-987', type: 'suv' },
  { id: 'v07', make: 'Toyota',  model: 'Corolla',   year: 2020, color: 'Gris perle',   plate: 'MNO-147', type: 'sedan' },
  { id: 'v08', make: 'Kia',     model: 'Sportage',  year: 2021, color: 'Vert forêt',   plate: 'PQR-258', type: 'suv' },
  { id: 'v09', make: 'Chevrolet',model: 'Malibu',   year: 2017, color: 'Champagne',    plate: 'STU-369', type: 'sedan', notes: 'Tache café siège passager' },
  { id: 'v10', make: 'Nissan',  model: 'Rogue',     year: 2022, color: 'Noir mat',     plate: 'VWX-147', type: 'suv' },
  { id: 'v11', make: 'Jeep',    model: 'Grand Cherokee', year: 2019, color: 'Bronze satiné', plate: 'YZA-258', type: 'suv', notes: 'Jantes à traiter' },
  { id: 'v12', make: 'BMW',     model: 'Série 3',   year: 2021, color: 'Blanc alpin',  plate: 'BCD-369', type: 'sedan' },
  { id: 'v13', make: 'Volkswagen',model: 'Tiguan',  year: 2020, color: 'Bleu acier',   plate: 'EFG-741', type: 'suv' },
  { id: 'v14', make: 'Audi',    model: 'Q5',        year: 2022, color: 'Gris quantum',  plate: 'HIJ-852', type: 'suv' },
  { id: 'v15', make: 'Honda',   model: 'CR-V',      year: 2021, color: 'Rouge rubis',  plate: 'KLM-963', type: 'suv' },
  { id: 'v16', make: 'Dodge',   model: 'Charger',   year: 2018, color: 'Noir fantôme', plate: 'NOP-159', type: 'sedan' },
  { id: 'v17', make: 'Hyundai', model: 'Elantra',   year: 2020, color: 'Argent froid', plate: 'QRS-357', type: 'compact' },
  { id: 'v18', make: 'Ford',    model: 'Explorer',  year: 2021, color: 'Blanc titane', plate: 'TUV-486', type: 'suv' },
]

// ── Customers ──────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  {
    id: 'c01', firstName: 'Martin',    lastName: 'Tremblay',
    phone: '418-555-0101', email: 'martin.tremblay@gmail.com',
    vehicles: [VEHICLES[0]],
    totalVisits: 12, totalSpent: 124700,
    lastVisit: daysAgo(7), preferredService: 'complete',
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'c02', firstName: 'Sarah',     lastName: 'Gagnon',
    phone: '418-555-0202',
    vehicles: [VEHICLES[1]],
    totalVisits: 5, totalSpent: 38500,
    lastVisit: daysAgo(14),
    createdAt: new Date('2024-07-02'),
  },
  {
    id: 'c03', firstName: 'François',  lastName: 'Roy',
    phone: '418-555-0303', email: 'francois.roy@outlook.com',
    vehicles: [VEHICLES[2]],
    totalVisits: 3, totalSpent: 29700,
    notes: 'Aime beaucoup le travail — laisse de bons pourboires',
    preferredService: 'complete',
    createdAt: new Date('2024-09-10'),
  },
  {
    id: 'c04', firstName: 'Marie-Ève', lastName: 'Bouchard',
    phone: '418-555-0404',
    vehicles: [VEHICLES[3], VEHICLES[4]],
    totalVisits: 8, totalSpent: 71200,
    lastVisit: daysAgo(3),
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'c05', firstName: 'Jean-Pierre',lastName: 'Lavoie',
    phone: '418-555-0505', email: 'jplavoie@videotron.ca',
    vehicles: [VEHICLES[5]],
    totalVisits: 2, totalSpent: 14800,
    createdAt: new Date('2024-11-05'),
  },
  {
    id: 'c06', firstName: 'Isabelle',  lastName: 'Côté',
    phone: '581-555-0606',
    vehicles: [VEHICLES[6]],
    totalVisits: 6, totalSpent: 45000,
    lastVisit: daysAgo(10),
    preferredService: 'exterior',
    createdAt: new Date('2024-04-12'),
  },
  {
    id: 'c07', firstName: 'Philippe',  lastName: 'Fortin',
    phone: '418-555-0707', email: 'phil.fortin@gmail.com',
    vehicles: [VEHICLES[7]],
    totalVisits: 9, totalSpent: 83700,
    notes: 'Préfère être contacté par SMS uniquement',
    preferredService: 'complete',
    createdAt: new Date('2024-01-08'),
  },
  {
    id: 'c08', firstName: 'Nathalie',  lastName: 'Bergeron',
    phone: '418-555-0808',
    vehicles: [VEHICLES[8]],
    totalVisits: 1, totalSpent: 6500,
    createdAt: new Date('2025-01-20'),
  },
  {
    id: 'c09', firstName: 'Alexandre', lastName: 'Pelletier',
    phone: '581-555-0909', email: 'alex.pelletier@hotmail.com',
    vehicles: [VEHICLES[9], VEHICLES[10]],
    totalVisits: 15, totalSpent: 148500,
    lastVisit: daysAgo(5),
    notes: 'Client fidèle — réduction 10% accordée',
    preferredService: 'complete',
    createdAt: new Date('2023-11-15'),
  },
  {
    id: 'c10', firstName: 'Véronique', lastName: 'Morin',
    phone: '418-555-1010',
    vehicles: [VEHICLES[11]],
    totalVisits: 4, totalSpent: 38400,
    createdAt: new Date('2024-06-30'),
  },
  {
    id: 'c11', firstName: 'Étienne',   lastName: 'Lefebvre',
    phone: '418-555-1111', email: 'etienne.lefebvre@icloud.com',
    vehicles: [VEHICLES[12], VEHICLES[13]],
    totalVisits: 7, totalSpent: 68300,
    lastVisit: daysAgo(2),
    createdAt: new Date('2024-05-14'),
  },
  {
    id: 'c12', firstName: 'Mélanie',   lastName: 'Ouellet',
    phone: '581-555-1212',
    vehicles: [VEHICLES[14], VEHICLES[15], VEHICLES[16]],
    totalVisits: 3, totalSpent: 24700,
    createdAt: new Date('2024-10-22'),
  },
]

// ── Bookings ───────────────────────────────────────────────────────────────

function makeBooking(
  id: string,
  customerId: string,
  vehicleId: string,
  serviceType: ServiceType,
  scheduledAt: Date,
  operationalStatus: OperationalStatus,
  paymentStatus: PaymentStatus,
  opts: Partial<Booking> = {}
): Booking {
  return {
    id,
    customerId,
    vehicleId,
    serviceType,
    scheduledAt,
    estimatedDuration: SERVICE_DURATIONS[serviceType],
    operationalStatus,
    paymentStatus,
    price: SERVICE_PRICES[serviceType],
    beforePhotos: [],
    afterPhotos: [],
    ...opts,
  }
}

export const BOOKINGS: Booking[] = [
  // ── AUJOURD'HUI ───────────────────────────────────────────────────────────
  makeBooking('b01', 'c01', 'v01', 'complete', today(10, 0),
    'in_progress', 'pending',
    { arrivedAt: today(9, 55), startedAt: today(10, 5), notes: 'Vérifier jantes spécialement' }
  ),
  makeBooking('b02', 'c02', 'v02', 'exterior', today(11, 30),
    'ready', 'paid',
    { arrivedAt: today(11, 25), startedAt: today(11, 35), completedAt: today(12, 20),
      smsReadySentAt: today(12, 21) }
  ),
  makeBooking('b03', 'c07', 'v08', 'interior', today(14, 0),
    'scheduled', 'unpaid'
  ),
  makeBooking('b04', 'c09', 'v10', 'complete', today(15, 30),
    'arrived', 'pending',
    { arrivedAt: today(15, 28) }
  ),

  // ── HIER ─────────────────────────────────────────────────────────────────
  makeBooking('b05', 'c03', 'v03', 'complete', daysAgo(1, 9, 0),
    'picked_up', 'paid',
    { arrivedAt: daysAgo(1, 8, 55), startedAt: daysAgo(1, 9, 10),
      completedAt: daysAgo(1, 10, 40), pickedUpAt: daysAgo(1, 11, 0) }
  ),
  makeBooking('b06', 'c04', 'v04', 'exterior', daysAgo(1, 10, 30),
    'picked_up', 'paid',
    { arrivedAt: daysAgo(1, 10, 28), startedAt: daysAgo(1, 10, 35),
      completedAt: daysAgo(1, 11, 20), pickedUpAt: daysAgo(1, 11, 30) }
  ),
  makeBooking('b07', 'c08', 'v09', 'exterior', daysAgo(1, 13, 0),
    'no_show', 'unpaid',
    { notes: 'Pas répondu aux appels' }
  ),
  makeBooking('b08', 'c06', 'v07', 'complete', daysAgo(1, 15, 0),
    'picked_up', 'paid',
    { arrivedAt: daysAgo(1, 15, 2), startedAt: daysAgo(1, 15, 15),
      completedAt: daysAgo(1, 16, 45), pickedUpAt: daysAgo(1, 17, 0), tip: 1000 }
  ),

  // ── AVANT-HIER ────────────────────────────────────────────────────────────
  makeBooking('b09', 'c05', 'v06', 'interior', daysAgo(2, 9, 30),
    'picked_up', 'paid'
  ),
  makeBooking('b10', 'c10', 'v12', 'complete', daysAgo(2, 11, 0),
    'cancelled', 'refunded',
    { notes: 'Client a rappelé pour annuler — maladie' }
  ),
  makeBooking('b11', 'c11', 'v13', 'exterior', daysAgo(2, 14, 0),
    'picked_up', 'paid'
  ),

  // ── IL Y A 3 JOURS ───────────────────────────────────────────────────────
  makeBooking('b12', 'c09', 'v11', 'complete', daysAgo(3, 9, 0),
    'picked_up', 'paid',
    { tip: 2000 }
  ),
  makeBooking('b13', 'c12', 'v15', 'exterior', daysAgo(3, 13, 30),
    'picked_up', 'paid'
  ),
  makeBooking('b14', 'c07', 'v08', 'interior', daysAgo(3, 16, 0),
    'picked_up', 'paid'
  ),

  // ── DEMAIN ───────────────────────────────────────────────────────────────
  makeBooking('b15', 'c02', 'v02', 'complete', daysAhead(1, 9, 0),
    'scheduled', 'unpaid'
  ),
  makeBooking('b16', 'c04', 'v05', 'exterior', daysAhead(1, 10, 30),
    'scheduled', 'unpaid'
  ),
  makeBooking('b17', 'c11', 'v14', 'interior', daysAhead(1, 14, 0),
    'scheduled', 'unpaid'
  ),

  // ── DANS 2 JOURS ─────────────────────────────────────────────────────────
  makeBooking('b18', 'c01', 'v01', 'exterior', daysAhead(2, 11, 0),
    'scheduled', 'unpaid'
  ),
  makeBooking('b19', 'c09', 'v10', 'complete', daysAhead(2, 13, 0),
    'scheduled', 'unpaid'
  ),
  makeBooking('b20', 'c06', 'v07', 'interior', daysAhead(2, 15, 30),
    'scheduled', 'unpaid'
  ),

  // ── DANS 3 JOURS ─────────────────────────────────────────────────────────
  makeBooking('b21', 'c03', 'v03', 'complete', daysAhead(3, 9, 0),
    'scheduled', 'unpaid'
  ),
  makeBooking('b22', 'c10', 'v12', 'exterior', daysAhead(3, 11, 30),
    'scheduled', 'unpaid'
  ),
  makeBooking('b23', 'c12', 'v17', 'interior', daysAhead(3, 14, 0),
    'scheduled', 'unpaid'
  ),
  makeBooking('b24', 'c05', 'v06', 'complete', daysAhead(3, 16, 0),
    'scheduled', 'unpaid'
  ),
]

// ── Lookup helpers ──────────────────────────────────────────────────────────

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find(c => c.id === id)
}

export function getVehicle(id: string): Vehicle | undefined {
  return VEHICLES.find(v => v.id === id)
}

export function getTodayBookings(): Booking[] {
  const today = new Date()
  return BOOKINGS.filter(b => {
    const d = b.scheduledAt
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth()    === today.getMonth()    &&
           d.getDate()     === today.getDate()
  })
}

export function getBookingsForDateRange(start: Date, end: Date): Booking[] {
  return BOOKINGS.filter(b => b.scheduledAt >= start && b.scheduledAt < end)
}

export function getTodayStats() {
  const bookings = getTodayBookings()
  const active   = bookings.filter(b =>
    ['in_progress','drying','quality_check'].includes(b.operationalStatus)
  )
  const ready    = bookings.filter(b => b.operationalStatus === 'ready')
  const revenue  = bookings
    .filter(b => ['paid','pending'].includes(b.paymentStatus) && !['cancelled','no_show'].includes(b.operationalStatus))
    .reduce((s, b) => s + b.price, 0)
  const estimated = bookings
    .filter(b => !['cancelled','no_show'].includes(b.operationalStatus))
    .reduce((s, b) => s + b.price, 0)
  const scheduled = bookings.filter(b => b.operationalStatus === 'scheduled')
  const next = scheduled.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0]
  return { active, ready, revenue, estimated, scheduled, next }
}
