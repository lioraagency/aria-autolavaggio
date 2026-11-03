import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'

// Fuseau du commerce (Québec). Gère l'heure d'été / l'heure normale automatiquement.
export const BUSINESS_TZ = 'America/Toronto'

// "2026-11-05" + "16:00" (heure locale du commerce) -> instant UTC réel.
export function businessLocalToUtc(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, BUSINESS_TZ)
}

// Instant -> "2026-11-05", date du jour à l'heure du commerce.
export function businessDateKey(value: string | Date): string {
  return formatInTimeZone(new Date(value), BUSINESS_TZ, 'yyyy-MM-dd')
}

// Minuit (heure du commerce) dans `offsetDays` jours, en instant UTC réel.
// Correct aussi les jours de changement d'heure (journées de 23 h ou 25 h).
export function businessDayStartUtc(offsetDays = 0, now: Date = new Date()): Date {
  const [y, m, d] = formatInTimeZone(now, BUSINESS_TZ, 'yyyy-MM-dd').split('-').map(Number)
  const day = new Date(Date.UTC(y, m - 1, d + offsetDays)).toISOString().slice(0, 10)
  return businessLocalToUtc(day, '00:00')
}

// Instant UTC (ISO ou Date) -> "jeudi 5 novembre 2026 à 16 h 00", à l'heure du commerce.
export function formatBusinessDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('fr-CA', {
    timeZone: BUSINESS_TZ,
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
