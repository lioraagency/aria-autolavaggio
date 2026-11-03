// Heures d'ouverture du commerce par jour de semaine (0 = dimanche), heure de Toronto.
// null = fermé toute la journée.
export type DayHours = { open: number; close: number }

export const HOURS_BY_DOW: Record<number, DayHours | null> = {
  0: null, 1: { open: 9, close: 17 }, 2: { open: 9, close: 17 },
  3: { open: 9, close: 21 }, 4: { open: 9, close: 21 },
  5: { open: 9, close: 17 }, 6: null,
}

// Jour de semaine d'une date "2026-11-05", indépendamment du fuseau de la machine.
export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}
