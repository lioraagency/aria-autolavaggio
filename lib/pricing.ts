import { ServiceType, SERVICE_PRICES } from '@/lib/types'

export const SUV_SURCHARGE = 2000

export const SUPPLEMENTS = [
  { key: 'calcium', label: 'Traitement calcium (+20$)', amount: 2000 },
  { key: 'moteur',  label: 'Shampoing moteur (+35$)',   amount: 3500 },
]

export function computeTotal(
  serviceType: ServiceType | null,
  supplements: string[],
  vehicleType?: string
): number {
  if (!serviceType) return 0
  const base = SERVICE_PRICES[serviceType]
  const suvExtra = vehicleType === 'suv' ? SUV_SURCHARGE : 0
  const extra = supplements.reduce((sum, s) => {
    const sup = SUPPLEMENTS.find(x => x.key === s)
    return sum + (sup ? sup.amount : 0)
  }, 0)
  return base + extra + suvExtra
}
