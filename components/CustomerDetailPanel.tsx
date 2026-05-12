'use client'

import { useState } from 'react'
import {
  Booking,
  Customer,
  Vehicle,
  OperationalStatus,
  SERVICE_LABELS,
  centsToDisplay,
  getNextStatus,
  getNextStatusLabel,
} from '@/lib/types'
import StatusPipeline from '@/components/StatusPipeline'
import StatusBadge from '@/components/StatusBadge'
import PhotoSlot from '@/components/PhotoSlot'

interface Props {
  booking: Booking
  customer: Customer
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
  onStatusAdvance: (bookingId: string, newStatus: OperationalStatus) => void
  onSmsSend: (bookingId: string) => void
}

const PLACEHOLDER_HISTORY = [
  { date: '12 avr. 2025', service: 'Service Complet', price: 9900 },
  { date: '1 mars 2025', service: 'Extérieur seul', price: 6500 },
  { date: '10 jan. 2025', service: 'Intérieur seul', price: 7000 },
]

export default function CustomerDetailPanel({
  booking,
  customer,
  vehicle,
  isOpen,
  onClose,
  onStatusAdvance,
  onSmsSend,
}: Props) {
  const [photos, setPhotos] = useState({ b1: '', b2: '', a1: '', a2: '' })
  const [notes, setNotes] = useState(customer.notes ?? '')

  if (!isOpen) return null

  const nextStatus = getNextStatus(booking.operationalStatus)
  const nextLabel = getNextStatusLabel(booking.operationalStatus)
  const isReady = booking.operationalStatus === 'ready'

  function handleAdvance() {
    if (nextStatus) onStatusAdvance(booking.id, nextStatus)
  }

  function handlePickedUp() {
    onStatusAdvance(booking.id, 'picked_up')
  }

  const scheduledTime = new Date(booking.scheduledAt).toLocaleTimeString('fr-CA', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const sinceYear = new Date(customer.createdAt).getFullYear()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 sheet-backdrop z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-aria-surface rounded-t-[24px] overflow-y-auto max-h-[92vh] animate-slide-up pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Section 1 — Handle + Header */}
        <div className="px-4">
          <div className="w-10 h-1 bg-aria-border rounded-full mx-auto mt-3 mb-4" />

          <div className="flex items-center justify-between mb-3">
            <span className="font-condensed font-black text-2xl text-aria-text">
              {customer.firstName} {customer.lastName}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-aria-muted"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <a
            href={`tel:${customer.phone}`}
            className="flex items-center justify-center gap-2 w-full h-11 border border-aria-border-strong rounded-xl text-aria-text font-condensed uppercase tracking-wider text-sm mb-4"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {customer.phone}
          </a>
        </div>

        {/* Section 2 — Stats strip */}
        <div className="border-y border-aria-border py-3 flex">
          <div className="flex-1 text-center">
            <div className="font-condensed font-black text-lg text-aria-text">{customer.totalVisits}</div>
            <div className="text-[10px] text-aria-muted uppercase tracking-wider">visites</div>
          </div>
          <div className="flex-1 text-center border-x border-aria-border">
            <div className="font-condensed font-black text-lg text-aria-text">{centsToDisplay(customer.totalSpent)}</div>
            <div className="text-[10px] text-aria-muted uppercase tracking-wider">dépensé</div>
          </div>
          <div className="flex-1 text-center">
            <div className="font-condensed font-black text-lg text-aria-text">{sinceYear}</div>
            <div className="text-[10px] text-aria-muted uppercase tracking-wider">depuis</div>
          </div>
        </div>

        {/* Section 3 — Vehicle card */}
        <div className="bg-aria-elevated rounded-xl p-4 mx-4 mt-4">
          <div className="font-condensed font-bold text-base text-aria-text">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <div className="text-aria-muted text-sm mt-0.5">
            {vehicle.color}{vehicle.plate ? ` · ${vehicle.plate}` : ''}
          </div>
          {vehicle.notes && (
            <div className="italic text-xs text-aria-muted mt-1">{vehicle.notes}</div>
          )}
        </div>

        {/* Section 4 — Current booking */}
        <div className="px-4 mt-5">
          <div className="text-xs uppercase tracking-widest text-aria-accent font-condensed mb-2">
            RDV en cours
          </div>

          <StatusPipeline status={booking.operationalStatus} />

          <div className="flex items-center justify-between mt-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-aria-text font-condensed">
                {SERVICE_LABELS[booking.serviceType]}
              </span>
              <span className="text-sm text-aria-muted">{scheduledTime}</span>
              <span className="text-sm text-aria-text font-condensed font-bold">
                {centsToDisplay(booking.price)}
              </span>
            </div>
            <StatusBadge status={booking.operationalStatus} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-2">
            {nextStatus && nextStatus !== 'picked_up' && nextLabel && (
              <button
                onClick={handleAdvance}
                className="w-full min-h-[52px] bg-aria-accent text-aria-bg font-condensed font-black text-base uppercase tracking-wider rounded-xl"
              >
                {nextLabel}
              </button>
            )}

            {isReady && (
              <>
                {!booking.smsReadySentAt ? (
                  <button
                    onClick={() => onSmsSend(booking.id)}
                    className="w-full min-h-[52px] border border-aria-success text-aria-success font-condensed font-black text-base uppercase tracking-wider rounded-xl"
                  >
                    SMS pret
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full min-h-[52px] border border-aria-border text-aria-muted font-condensed font-black text-base uppercase tracking-wider rounded-xl cursor-not-allowed"
                  >
                    SMS envoye
                  </button>
                )}

                <button
                  onClick={handlePickedUp}
                  className="w-full min-h-[52px] bg-aria-accent text-aria-bg font-condensed font-black text-base uppercase tracking-wider rounded-xl"
                >
                  Marquer recupere + Paiement
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section 5 — Photos */}
        <div className="px-4 mt-5">
          <div className="text-xs uppercase tracking-widest text-aria-accent font-condensed mb-3">
            Photos
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PhotoSlot
              label="Avant 1"
              imageUrl={photos.b1 || undefined}
              onCapture={(url) => setPhotos((p) => ({ ...p, b1: url }))}
            />
            <PhotoSlot
              label="Avant 2"
              imageUrl={photos.b2 || undefined}
              onCapture={(url) => setPhotos((p) => ({ ...p, b2: url }))}
            />
            <PhotoSlot
              label="Apres 1"
              imageUrl={photos.a1 || undefined}
              onCapture={(url) => setPhotos((p) => ({ ...p, a1: url }))}
            />
            <PhotoSlot
              label="Apres 2"
              imageUrl={photos.a2 || undefined}
              onCapture={(url) => setPhotos((p) => ({ ...p, a2: url }))}
            />
          </div>
        </div>

        {/* Section 6 — Historique */}
        <div className="px-4 mt-5">
          <div className="text-xs uppercase tracking-widest text-aria-accent font-condensed mb-2">
            3 dernieres visites
          </div>
          <div>
            {PLACEHOLDER_HISTORY.map((row, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b border-aria-border"
              >
                <span className="text-sm text-aria-muted">{row.date}</span>
                <span className="text-sm text-aria-text">{row.service}</span>
                <span className="text-sm text-aria-text font-condensed font-bold">
                  {centsToDisplay(row.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7 — Notes */}
        <div className="px-4 mt-5">
          <div className="text-xs uppercase tracking-widest text-aria-accent font-condensed mb-2">
            Notes client
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] bg-aria-elevated border border-aria-border rounded-xl p-3 text-sm text-aria-text resize-none focus:outline-none focus:border-aria-border-strong"
            placeholder="Aucune note..."
          />
        </div>

        {/* Section 8 — Danger zone */}
        <div className="px-4 mt-4 mb-6">
          <button className="w-full h-12 border border-aria-danger/40 text-aria-danger font-condensed font-black uppercase tracking-wider text-sm rounded-xl">
            Annuler ce RDV
          </button>
        </div>
      </div>
    </>
  )
}
