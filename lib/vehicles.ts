// Source unique des types de véhicule et de leurs libellés.
// Ajouter un type ici oblige (par le typage) à lui donner un libellé et une catégorie de prix.

export const VEHICLE_TYPES = ['sedan', 'suv_compact', 'suv', 'truck', 'compact'] as const
export type VehicleType = (typeof VEHICLE_TYPES)[number]

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  sedan:       'Berline',
  suv_compact: 'VUS compact',
  suv:         'VUS',
  truck:       'Pick-up',
  compact:     'Compacte',
}

// Types proposés au client dans le formulaire ("compact" est un ancien type, plus proposé)
export const SELECTABLE_VEHICLE_TYPES: VehicleType[] = ['sedan', 'suv_compact', 'suv', 'truck']

export function isVehicleType(value: unknown): value is VehicleType {
  return typeof value === 'string' && (VEHICLE_TYPES as readonly string[]).includes(value)
}
