import { ServiceType, SERVICE_PRICES } from '@/lib/types'
import type { VehicleType } from '@/lib/vehicles'

// ── Catégorie de prix par type de véhicule ────────────────────────────────────
// Règle confirmée par le client (2026-11-04) :
//   berline (prix de base) : sedan, suv_compact, compact
//   VUS (prix majoré)      : suv, truck (pick-up)
// Record<VehicleType, …> : un nouveau type de véhicule ne compile pas sans catégorie.
export type PriceTier = 'standard' | 'suv'

export const VEHICLE_PRICE_TIER: Record<VehicleType, PriceTier> = {
  sedan:       'standard',
  suv_compact: 'standard',
  compact:     'standard',
  suv:         'suv',
  truck:       'suv',
}

// Libellé de la catégorie majorée, utilisé dans tous les textes de prix
export const SUV_TIER_LABEL = 'VUS/pick-up'

export function priceTier(vehicleType: VehicleType): PriceTier {
  return VEHICLE_PRICE_TIER[vehicleType]
}

// Majoration du service pour la catégorie VUS
export const SUV_SURCHARGE_BY_SERVICE: Record<ServiceType, number> = {
  exterior: 0,
  interior: 1500,
  complete: 2000,
}

export const SERVICE_NAMES_FR: Record<ServiceType, string> = {
  exterior: 'Lavage extérieur',
  interior: 'Lavage intérieur',
  complete: 'Lavage complet',
}

export const SUPPLEMENT_NAMES_FR: Record<string, string> = {
  calcium: 'Traitement calcium',
  moteur: 'Shampoing moteur',
  ceramique: 'Traitement céramique + décontamination',
  mouche: 'Produit à mouche',
}

// ── Textes de prix, toujours générés depuis les montants ci-dessus ──────────
// space = true : style des courriels ("25 $") ; false : style du site ("25$")
export function formatDollars(cents: number, space = false): string {
  return `${Math.round(cents / 100)}${space ? ' ' : ''}$`
}

// "+25$" ou, si le prix dépend du véhicule, "+199$ / +249$ VUS/pick-up"
export function supplementPriceText(sup: { amount: number; amountBySuv?: number }, space = false): string {
  const base = `+${formatDollars(sup.amount, space)}`
  return sup.amountBySuv ? `${base} / +${formatDollars(sup.amountBySuv, space)} ${SUV_TIER_LABEL}` : base
}

// "+15$ pour VUS/pick-up", ou null si le service n'a pas de majoration
export function surchargeText(serviceType: ServiceType, space = false): string | null {
  const cents = SUV_SURCHARGE_BY_SERVICE[serviceType]
  return cents > 0 ? `+${formatDollars(cents, space)} pour ${SUV_TIER_LABEL}` : null
}

type Supplement = { key: string; label: string; amount: number; amountBySuv?: number }

const SUPPLEMENT_AMOUNTS: Omit<Supplement, 'label'>[] = [
  { key: 'calcium',   amount: 2500 },
  { key: 'moteur',    amount: 4000 },
  { key: 'ceramique', amount: 19900, amountBySuv: 24900 },
  { key: 'mouche',    amount: 2500 },
]

// label (ex. "Traitement calcium (+25$)") généré : un changement de montant suffit
export const SUPPLEMENTS: Supplement[] = SUPPLEMENT_AMOUNTS.map(s => ({
  ...s,
  label: `${SUPPLEMENT_NAMES_FR[s.key] ?? s.key} (${supplementPriceText(s)})`,
}))

export function vehicleSurcharge(serviceType: ServiceType, vehicleType: VehicleType): number {
  return priceTier(vehicleType) === 'suv' ? SUV_SURCHARGE_BY_SERVICE[serviceType] : 0
}

export function supplementPrice(sup: Supplement, vehicleType: VehicleType): number {
  return priceTier(vehicleType) === 'suv' && sup.amountBySuv ? sup.amountBySuv : sup.amount
}

// ── Calcul unique : écran de confirmation, serveur et courriels l'appellent ───
export interface PriceLine {
  kind: 'service' | 'surcharge' | 'supplement'
  label: string
  cents: number
}
export interface PriceBreakdown { lines: PriceLine[]; totalCents: number }

export function buildPriceBreakdown(
  serviceType: ServiceType | null,
  supplements: string[],
  vehicleType: VehicleType
): PriceBreakdown {
  if (!serviceType) return { lines: [], totalCents: 0 }
  const isSuvTier = priceTier(vehicleType) === 'suv'
  const lines: PriceLine[] = []

  lines.push({
    kind: 'service',
    label: SERVICE_NAMES_FR[serviceType] ?? serviceType,
    cents: SERVICE_PRICES[serviceType],
  })

  const surcharge = vehicleSurcharge(serviceType, vehicleType)
  if (surcharge > 0) {
    lines.push({ kind: 'surcharge', label: `Supplément ${SUV_TIER_LABEL}`, cents: surcharge })
  }

  for (const s of supplements) {
    const sup = SUPPLEMENTS.find(x => x.key === s)
    if (!sup) continue
    const suffix = isSuvTier && sup.amountBySuv ? ` (${SUV_TIER_LABEL})` : ''
    lines.push({ kind: 'supplement', label: (SUPPLEMENT_NAMES_FR[s] ?? s) + suffix, cents: supplementPrice(sup, vehicleType) })
  }

  return { lines, totalCents: lines.reduce((sum, l) => sum + l.cents, 0) }
}

export function computeTotal(
  serviceType: ServiceType | null,
  supplements: string[],
  vehicleType: VehicleType
): number {
  return buildPriceBreakdown(serviceType, supplements, vehicleType).totalCents
}

export function formatBreakdownText(b: PriceBreakdown): string {
  const rows = b.lines.map(l => `${l.label} — ${Math.round(l.cents / 100)} $`)
  rows.push('─────────────')
  rows.push(`Total — ${Math.round(b.totalCents / 100)} $`)
  return rows.join('\n')
}
