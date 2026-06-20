/**
 * In-memory alert store.
 * Used as fallback when Supabase is not configured, and as primary store for
 * alerts created via the public-bookings mock API.
 *
 * Module-level singletons persist for the lifetime of the Node.js server
 * process (hot between requests, resets on cold start/redeploy).
 */

import type { Alert, AlertType } from './types'

let nextId = 100

function makeId(): string {
  return `a${++nextId}`
}

export const ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'rdv',
    title: 'Nouveau RDV',
    body: 'Sarah B. a réservé Extérieur seul · 13h30',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60_000),
  },
  {
    id: 'a2',
    type: 'rappel',
    title: 'RDV dans 15 min',
    body: 'Martin L. · Service Complet · 10h00',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60_000),
  },
  {
    id: 'a3',
    type: 'annulation',
    title: 'Annulation',
    body: "Jean-Marc P. a annulé son RDV de 14h30",
    isRead: true,
    createdAt: new Date(new Date().setHours(8, 12, 0, 0)),
  },
  {
    id: 'a4',
    type: 'vide',
    title: 'Plage disponible',
    body: "2h libres entre 11h45 et 13h30 aujourd'hui",
    isRead: true,
    createdAt: new Date(new Date().setHours(7, 0, 0, 0)),
  },
  {
    id: 'a5',
    type: 'demande',
    title: 'Demande spéciale',
    body: 'Louis T. demande un shampoing moteur · +40$',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60_000 - 2 * 60 * 60_000),
  },
]

export function getAlerts(): Alert[] {
  // Unread first, then by creation date desc
  return [...ALERTS].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

export function getUnreadCount(): number {
  return ALERTS.filter(a => !a.isRead).length
}

export function addAlert(data: { type: AlertType; title: string; body: string; reservationId?: string }): Alert {
  const alert: Alert = {
    id: makeId(),
    ...data,
    isRead: false,
    createdAt: new Date(),
  }
  ALERTS.unshift(alert)
  return alert
}

export function markAlertRead(id: string): boolean {
  const alert = ALERTS.find(a => a.id === id)
  if (!alert) return false
  alert.isRead = true
  return true
}

export function markAllRead(): void {
  ALERTS.forEach(a => { a.isRead = true })
}
