import { ServiceType, SERVICE_PRICES } from '@/lib/types'

export const SUV_SURCHARGE_BY_SERVICE: Record<string, number> = {
  exterior: 0,
  interior: 1500,
  complete: 2000,
}

type Supplement = { key: string; label: string; amount: number; amountBySuv?: number }

export const SUPPLEMENTS: Supplement[] = [
  { key: 'calcium',   label: 'Traitement calcium (+25$)',                                   amount: 2500 },
  { key: 'moteur',    label: 'Shampoing moteur (+40$)',                                     amount: 4000 },
  { key: 'ceramique', label: 'Traitement céramique + décontamination (+199$ / +249$ VUS)', amount: 19900, amountBySuv: 24900 },
  { key: 'mouche',    label: 'Produit à mouche (+25$)',                                    amount: 2500 },
]

export function computeTotal(
  serviceType: ServiceType | null,
  supplements: string[],
  vehicleType?: string
): number {
  if (!serviceType) return 0
  const base = SERVICE_PRICES[serviceType]
  const suvExtra = (vehicleType === 'suv')
    ? (SUV_SURCHARGE_BY_SERVICE[serviceType] ?? 0)
    : 0
  const extra = supplements.reduce((sum, s) => {
    const sup = SUPPLEMENTS.find(x => x.key === s)
    if (!sup) return sum
    const isSuv = vehicleType === 'suv'
    return sum + (isSuv && sup.amountBySuv ? sup.amountBySuv : sup.amount)
  }, 0)
  return base + extra + suvExtra
}

const SERVICE_NAMES_FR: Record<string, string> = {
  exterior: 'Lavage extérieur',
  interior: 'Lavage intérieur',
  complete: 'Lavage complet',
}

const SUPPLEMENT_NAMES_FR: Record<string, string> = {
  calcium: 'Traitement calcium',
  moteur: 'Shampoing moteur',
  ceramique: 'Traitement céramique + décontamination',
  mouche: 'Produit à mouche',
}

export interface PriceLine { label: string; cents: number }
export interface PriceBreakdown { lines: PriceLine[]; totalCents: number }

export function buildPriceBreakdown(
  serviceType: ServiceType | null,
  supplements: string[],
  vehicleType?: string
): PriceBreakdown {
  if (!serviceType) return { lines: [], totalCents: 0 }
  const isSuv = vehicleType === 'suv'
  const lines: PriceLine[] = []

  lines.push({
    label: SERVICE_NAMES_FR[serviceType] ?? serviceType,
    cents: SERVICE_PRICES[serviceType],
  })

  const suvExtra = isSuv ? (SUV_SURCHARGE_BY_SERVICE[serviceType] ?? 0) : 0
  if (suvExtra > 0) {
    lines.push({ label: 'Supplément VUS', cents: suvExtra })
  }

  for (const s of supplements) {
    const sup = SUPPLEMENTS.find(x => x.key === s)
    if (!sup) continue
    const cents = isSuv && sup.amountBySuv ? sup.amountBySuv : sup.amount
    const suffix = isSuv && sup.amountBySuv ? ' (VUS)' : ''
    lines.push({ label: (SUPPLEMENT_NAMES_FR[s] ?? s) + suffix, cents })
  }

  return { lines, totalCents: lines.reduce((sum, l) => sum + l.cents, 0) }
}

export function formatBreakdownText(b: PriceBreakdown): string {
  const rows = b.lines.map(l => `${l.label} — ${Math.round(l.cents / 100)} $`)
  rows.push('─────────────')
  rows.push(`Total — ${Math.round(b.totalCents / 100)} $`)
  return rows.join('\n')
}
