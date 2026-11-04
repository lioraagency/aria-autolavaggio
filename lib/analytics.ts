// Vercel Web Analytics sans paquet npm (script /_vercel/insights/script.js chargé dans le layout).
// Événements personnalisés : jamais de données personnelles.
type VaFn = (event: 'event', payload: { name: string; data?: Record<string, string | number> }) => void

export function track(name: string, data?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return
  const va = (window as unknown as { va?: VaFn }).va
  va?.('event', { name, data })
}
