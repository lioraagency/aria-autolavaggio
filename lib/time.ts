import { fromZonedTime } from 'date-fns-tz'

// Fuseau du commerce (Québec). Gère l'heure d'été / l'heure normale automatiquement.
export const BUSINESS_TZ = 'America/Toronto'

// "2026-11-05" + "16:00" (heure locale du commerce) -> instant UTC réel.
export function businessLocalToUtc(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, BUSINESS_TZ)
}
