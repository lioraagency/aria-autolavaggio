'use client'

import type { ChangeEvent } from 'react'
import { ServiceType, VehicleType, SERVICE_DURATIONS } from '@/lib/types'
import { SUPPLEMENTS, computeTotal } from '@/lib/pricing'

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

type BookingFormUpdater =
  | Partial<BookingFormState>
  | ((prev: BookingFormState) => Partial<BookingFormState>)

interface StepProps {
  state: BookingFormState
  onChange: (updates: BookingFormUpdater) => void
  onNext: () => void
  onBack: () => void
}

const SERVICES: { key: ServiceType; label: string; price: number; duration: number; badge?: string; sub?: string }[] = [
  { key: 'exterior', label: 'Extérieur Seul', price: 6500, duration: 45 },
  { key: 'interior', label: 'Intérieur Seul', price: 7000, duration: 60, sub: '+15$ pour VUS' },
  { key: 'complete', label: 'Service Complet', price: 9900, duration: 90, sub: '+20$ pour VUS', badge: 'Recommandé' },
]


export default function StepService({ state, onChange, onNext }: StepProps) {
  function handleServiceSelect(key: ServiceType) {
    const newSupplements = state.supplements
    const total = computeTotal(key, newSupplements, state.vehicleType)
    onChange({ serviceType: key, totalPrice: total })
  }

  function handleSupplementChange(key: string, e: ChangeEvent<HTMLInputElement>) {
    const checked = e.currentTarget.checked
    onChange(prev => {
      const newSupplements = checked
        ? [...prev.supplements.filter(s => s !== key), key]
        : prev.supplements.filter(s => s !== key)
      return {
        supplements: newSupplements,
        totalPrice: computeTotal(prev.serviceType, newSupplements, prev.vehicleType),
      }
    })
  }

  const totalDisplay = Math.round(state.totalPrice / 100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-condensed font-black text-3xl uppercase text-aria-text tracking-wide mb-1">
          Quel service?
        </h2>
        <p className="text-aria-muted text-sm font-sans">Choisissez la formule qui vous convient.</p>
      </div>

      <div className="flex flex-col gap-3">
        {SERVICES.map(svc => {
          const selected = state.serviceType === svc.key
          return (
            <button
              key={svc.key}
              type="button"
              onClick={() => handleServiceSelect(svc.key)}
              className={`w-full text-left rounded-xl p-4 transition-all ${
                selected
                  ? 'border border-aria-accent bg-aria-accent/5'
                  : 'border border-[rgba(255,255,255,0.06)] bg-aria-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-condensed font-black text-lg uppercase text-aria-text tracking-wide">
                      {svc.label}
                    </span>
                    {svc.badge && (
                      <span className="bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase text-xs px-2 py-0.5 rounded-full">
                        {svc.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-aria-muted text-sm font-sans">{SERVICE_DURATIONS[svc.key]} min</span>
                  {svc.sub && (
                    <span className="text-aria-dim text-xs font-sans">{svc.sub}</span>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-condensed font-black text-2xl text-aria-text">
                    {Math.round(svc.price / 100)}$
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Suppléments
        </span>
        {SUPPLEMENTS.map(sup => {
          const checked = state.supplements.includes(sup.key)
          return (
            <label
              key={sup.key}
              className="relative block min-h-[44px] cursor-pointer touch-manipulation rounded-xl border border-[rgba(255,255,255,0.06)] bg-aria-surface transition-colors active:bg-aria-elevated"
            >
              <input
                type="checkbox"
                name={`supplement-${sup.key}`}
                checked={checked}
                onChange={e => handleSupplementChange(sup.key, e)}
                className="absolute inset-0 z-10 m-0 h-full min-h-[44px] w-full cursor-pointer opacity-0"
              />
              <div className="pointer-events-none flex min-h-[44px] items-center gap-4 px-4 py-3">
                <div
                  aria-hidden="true"
                  className={`relative z-0 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                    checked
                      ? 'border-aria-accent bg-aria-accent'
                      : 'border-[rgba(255,255,255,0.25)] bg-transparent'
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                      <path d="M2 6l3 3 5-5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="relative z-0 flex-1 font-sans text-sm text-aria-text">{sup.label}</span>
              </div>
            </label>
          )
        })}
      </div>

      <div className="border border-[rgba(255,255,255,0.06)] rounded-xl p-4 bg-aria-surface">
        <div className="flex items-baseline justify-between">
          <span className="text-aria-muted font-condensed uppercase text-sm tracking-wider">Total estimé</span>
          <span className="text-aria-accent font-condensed font-black text-2xl">
            {state.serviceType ? `${totalDisplay} $` : '— $'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!state.serviceType}
        className="bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase text-lg w-full py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Continuer →
      </button>
    </div>
  )
}
