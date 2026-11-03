import { fromZonedTime } from 'date-fns-tz'

// Fuseau du commerce (Québec). Gère l'heure d'été / l'heure normale automatiquement.
export const BUSINESS_TZ = 'America/Toronto'

// "2026-11-05" + "16:00" (heure locale du commerce) -> instant UTC réel.
export function businessLocalToUtc(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, BUSINESS_TZ)
}

// Instant UTC (ISO ou Date) -> "jeudi 5 novembre 2026 à 16 h 00", à l'heure du commerce.
export function formatBusinessDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('fr-CA', {
    timeZone: BUSINESS_TZ,
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
