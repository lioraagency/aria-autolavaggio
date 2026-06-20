import { ServiceType, SERVICE_PRICES } from '@/lib/types'

export const SUV_SURCHARGE_BY_SERVICE: Record<string, number> = {
  exterior: 0,
  interior: 1500,
  complete: 2000,
}

export const SUPPLEMENTS = [
  { key: 'calcium', label: 'Traitement calcium (+25$)', amount: 2500 },
  { key: 'moteur',  label: 'Shampoing moteur (+40$)',   amount: 4000 },
]

export function computeTotal(
  serviceType: ServiceType | null,
  supplements: string[],
  vehicleType?: string
): number {
  if (!serviceType) return 0
  const base = SERVICE_PRICES[serviceType]
  const suvExtra = (vehicleType === 'suv' || vehicleType === 'truck')
    ? (SUV_SURCHARGE_BY_SERVICE[serviceType] ?? 0)
    : 0
  const extra = supplements.reduce((sum, s) => {
    const sup = SUPPLEMENTS.find(x => x.key === s)
    return sum + (sup ? sup.amount : 0)
  }, 0)
  return base + extra + suvExtra
}
