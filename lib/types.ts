export type OperationalStatus =
  | 'scheduled'
  | 'arrived'
  | 'in_progress'
  | 'drying'
  | 'quality_check'
  | 'ready'
  | 'picked_up'
  | 'cancelled'
  | 'no_show'

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'refunded'

export type ServiceType = 'exterior' | 'interior' | 'complete'

export type VehicleType = 'sedan' | 'suv' | 'suv_compact' | 'truck' | 'compact'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  color: string
  plate?: string
  type: VehicleType
  notes?: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  vehicles: Vehicle[]
  totalVisits: number
  totalSpent: number   // En cents
  lastVisit?: Date
  notes?: string
  preferredService?: ServiceType
  createdAt: Date
}

export interface Booking {
  id: string
  customerId: string
  vehicleId: string
  serviceType: ServiceType
  scheduledAt: Date
  estimatedDuration: number
  operationalStatus: OperationalStatus
  paymentStatus: PaymentStatus
  price: number        // En cents
  tip?: number
  notes?: string
  beforePhotos: string[]
  afterPhotos: string[]
  arrivedAt?: Date
  startedAt?: Date
  completedAt?: Date
  pickedUpAt?: Date
  smsReadySentAt?: Date
}

// ── Display helpers ──────────────────────────────────────────────────────────

export const SERVICE_LABELS: Record<ServiceType, string> = {
  exterior: 'Extérieur seul',
  interior: 'Intérieur seul',
  complete: 'Service Complet',
}

export const SERVICE_PRICES: Record<ServiceType, number> = {
  exterior: 6500,   // 65.00 $
  interior: 7000,
  complete: 9900,
}

export const SERVICE_DURATIONS: Record<ServiceType, number> = {
  exterior: 45,
  interior: 60,
  complete: 90,
}

export const OPERATIONAL_STATUS_LABELS: Record<OperationalStatus, string> = {
  scheduled:     'Planifié',
  arrived:       'Arrivé',
  in_progress:   'En cours',
  drying:        'Séchage',
  quality_check: 'Inspection',
  ready:         'Prêt',
  picked_up:     'Récupéré',
  cancelled:     'Annulé',
  no_show:       'No-show',
}

export const OPERATIONAL_PIPELINE: OperationalStatus[] = [
  'scheduled',
  'arrived',
  'in_progress',
  'drying',
  'quality_check',
  'ready',
  'picked_up',
]

export const STATUS_COLORS: Record<OperationalStatus, string> = {
  scheduled:     '#8A8A8A',
  arrived:       '#0A84FF',
  in_progress:   '#D5FC96',
  drying:        '#64D2FF',
  quality_check: '#FF9F0A',
  ready:         '#30D158',
  picked_up:     '#5A5A5A',
  cancelled:     '#FF453A',
  no_show:       '#FF453A',
}

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid:   'Non payé',
  pending:  'En attente',
  paid:     'Payé',
  refunded: 'Remboursé',
}

export function centsToDisplay(cents: number): string {
  return `${Math.round(cents / 100)} $`
}

export function getNextStatus(current: OperationalStatus): OperationalStatus | null {
  const idx = OPERATIONAL_PIPELINE.indexOf(current)
  if (idx === -1 || idx >= OPERATIONAL_PIPELINE.length - 1) return null
  return OPERATIONAL_PIPELINE[idx + 1]
}

// ── Alert ─────────────────────────────────────────────────────────────────

export type AlertType = 'rdv' | 'annulation' | 'rappel' | 'vide' | 'demande'

export interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  reservationId?: string
  isRead: boolean
  createdAt: Date
}

export function getNextStatusLabel(current: OperationalStatus): string | null {
  const next = getNextStatus(current)
  if (!next) return null
  const labels: Partial<Record<OperationalStatus, string>> = {
    arrived:       'Marquer arrivé',
    in_progress:   'Démarrer le lavage',
    drying:        'Mise en séchage',
    quality_check: 'Inspection finale',
    ready:         'Marquer prêt',
    picked_up:     'Marquer récupéré',
  }
  return labels[next] ?? OPERATIONAL_STATUS_LABELS[next]
}
