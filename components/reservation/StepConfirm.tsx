'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceType, SERVICE_LABELS, VehicleType } from '@/lib/types'
import { SUV_SURCHARGE_BY_SERVICE } from '@/lib/pricing'

interface BookingFormState {
  serviceType: ServiceType | null
  supplements: string[]
  totalPrice: number
  vehicleType: VehicleType
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  vehicleNotes: string
  date: string
  time: string
  firstName: string
  lastName: string
  phone: string
  email: string
  smsOptIn: boolean
  isFirstVisit: boolean
}

interface StepProps {
  state: BookingFormState
  onChange: (updates: Partial<BookingFormState>) => void
  onNext: () => void
  onBack: () => void
}

const SUPPLEMENT_LABELS: Record<string, string> = {
  calcium: 'Traitement calcium',
  moteur: 'Shampoing moteur',
}

const DOW_LABELS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MONTH_LABELS_FULL = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function formatDate(dateStr: string, time: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const dow = DOW_LABELS_FULL[d.getDay()]
  const day = d.getDate()
  const month = MONTH_LABELS_FULL[d.getMonth()]
  const year = d.getFullYear()
  return `${dow} ${day} ${month} ${year} à ${time}`
}

function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: 'Berline',
  suv: 'VUS',
  truck: 'Pickup',
  compact: 'Compacte',
}

export default function StepConfirm({ state, onBack }: StepProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: state.serviceType,
          supplements: state.supplements,
          totalPrice: state.totalPrice,
          vehicleType: state.vehicleType,
          vehicleMake: state.vehicleMake,
          vehicleModel: state.vehicleModel,
          vehicleYear: state.vehicleYear,
          vehicleColor: state.vehicleColor,
          vehicleNotes: state.vehicleNotes || undefined,
          date: state.date,
          time: state.time,
          firstName: state.firstName,
          lastName: state.lastName,
          phone: state.phone,
          email: state.email || undefined,
          smsOptIn: state.smsOptIn,
          isFirstVisit: state.isFirstVisit,
        }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
        const msg =
          typeof body?.message === 'string' && body.message.length > 0
            ? body.message
            : typeof body?.error === 'string' && body.error.length > 0
            ? body.error
            : `Erreur ${res.status}`
        throw new Error(msg)
      }

      const data: { success: boolean; bookingId: string; bookingNumber: string } = await res.json()

      if (!data.success) throw new Error('La réservation a échoué.')

      router.push(`/reservation/confirmation?id=${data.bookingId}&num=${data.bookingNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setLoading(false)
    }
  }

  const totalDisplay = Math.round(state.totalPrice / 100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-condensed font-black text-3xl uppercase text-aria-text tracking-wide mb-1">
          Confirmation
        </h2>
        <p className="text-aria-muted text-sm font-sans">Vérifiez les détails avant de confirmer.</p>
      </div>

      {/* Service summary */}
      <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col gap-2">
        <span className="font-condensed font-black uppercase text-aria-muted text-xs tracking-wider">Service</span>
        <span className="font-condensed font-black text-xl uppercase text-aria-text">
          {state.serviceType ? SERVICE_LABELS[state.serviceType] : '—'}
        </span>
        {state.supplements.length > 0 && (
          <div className="flex flex-col gap-1">
            {state.supplements.map(s => (
              <span key={s} className="text-aria-muted text-sm font-sans">
                + {SUPPLEMENT_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        )}
        {state.vehicleType === 'suv' && state.serviceType && (SUV_SURCHARGE_BY_SERVICE[state.serviceType] ?? 0) > 0 && (
          <span className="text-aria-accent text-sm font-sans">
            + Supplément VUS (+{(SUV_SURCHARGE_BY_SERVICE[state.serviceType] ?? 0) / 100}$)
          </span>
        )}
        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-aria-muted text-sm font-sans">Total</span>
            <span className="text-aria-muted text-xs font-sans">avant taxes</span>
          </div>
          <span className="text-aria-accent font-condensed font-black text-2xl">{totalDisplay} $</span>
        </div>
      </div>

      {/* Vehicle summary */}
      <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col gap-2">
        <span className="font-condensed font-black uppercase text-aria-muted text-xs tracking-wider">Véhicule</span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-aria-elevated border border-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded text-aria-muted text-xs font-condensed uppercase">
            {VEHICLE_TYPE_LABELS[state.vehicleType]}
          </span>
          <span className="text-aria-text font-sans text-sm">
            {state.vehicleMake} {state.vehicleModel} {state.vehicleYear}
          </span>
          <span className="text-aria-muted text-sm font-sans">— {state.vehicleColor}</span>
        </div>
      </div>

      {/* DateTime summary */}
      <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col gap-1">
        <span className="font-condensed font-black uppercase text-aria-muted text-xs tracking-wider">Date et heure</span>
        <span className="text-aria-text font-sans text-sm capitalize">
          {formatDate(state.date, state.time)}
        </span>
      </div>

      {/* Customer summary */}
      <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col gap-1">
        <span className="font-condensed font-black uppercase text-aria-muted text-xs tracking-wider">Client</span>
        <span className="text-aria-text font-sans text-sm">
          {state.firstName} {state.lastName}
        </span>
        <span className="text-aria-muted font-sans text-sm">{maskPhone(state.phone)}</span>
        {state.email && (
          <span className="text-aria-muted font-sans text-sm">{state.email}</span>
        )}
      </div>

      {/* Payment disclaimer */}
      <div className="bg-aria-elevated border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
        <p className="text-aria-muted text-sm font-sans">
          Le paiement se fait sur place. Aucune carte requise pour réserver.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-aria-danger/10 border border-aria-danger/30 rounded-xl p-4">
          <p className="text-aria-danger text-sm font-sans">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase text-lg w-full py-5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? 'Confirmation en cours...' : 'Confirmer ma réservation →'}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="text-aria-muted font-condensed uppercase text-sm hover:text-aria-text transition-colors disabled:opacity-50"
      >
        ← Modifier
      </button>
    </div>
  )
}
