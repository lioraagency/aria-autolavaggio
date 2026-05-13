'use client'

import { ServiceType, SERVICE_PRICES, SERVICE_DURATIONS } from '@/lib/types'

interface BookingFormState {
  serviceType: ServiceType | null
  supplements: string[]
  totalPrice: number
  vehicleType: 'sedan' | 'suv' | 'truck' | 'compact'
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

const SERVICES: { key: ServiceType; label: string; price: number; duration: number; badge?: string; sub?: string }[] = [
  { key: 'exterior', label: 'Extérieur Seul', price: 6500, duration: 45 },
  { key: 'interior', label: 'Intérieur Seul', price: 7000, duration: 60, sub: '+15$ pour VUS' },
  { key: 'complete', label: 'Service Complet', price: 9900, duration: 90, sub: '+20$ pour VUS', badge: 'Recommandé' },
]

const SUPPLEMENTS = [
  { key: 'calcium', label: 'Traitement calcium (+20$)', amount: 2000 },
  { key: 'moteur', label: 'Shampoing moteur (+35$)', amount: 3500 },
]

function computeTotal(serviceType: ServiceType | null, supplements: string[]): number {
  if (!serviceType) return 0
  const base = SERVICE_PRICES[serviceType]
  const extra = supplements.reduce((sum, s) => {
    const sup = SUPPLEMENTS.find(x => x.key === s)
    return sum + (sup ? sup.amount : 0)
  }, 0)
  return base + extra
}

export default function StepService({ state, onChange, onNext }: StepProps) {
  function handleServiceSelect(key: ServiceType) {
    const newSupplements = state.supplements
    const total = computeTotal(key, newSupplements)
    onChange({ serviceType: key, totalPrice: total })
  }

  function handleSupplementToggle(key: string) {
    const already = state.supplements.includes(key)
    const newSupplements = already
      ? state.supplements.filter(s => s !== key)
      : [...state.supplements, key]
    const total = computeTotal(state.serviceType, newSupplements)
    onChange({ supplements: newSupplements, totalPrice: total })
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
        {SUPPLEMENTS.map(sup => (
          <label
            key={sup.key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                state.supplements.includes(sup.key)
                  ? 'bg-aria-accent border-aria-accent'
                  : 'border-[rgba(255,255,255,0.12)] bg-aria-surface'
              }`}
              onClick={() => handleSupplementToggle(sup.key)}
            >
              {state.supplements.includes(sup.key) && (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <path d="M2 6l3 3 5-5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              name={`supplement-${sup.key}`}
              className="sr-only"
              checked={state.supplements.includes(sup.key)}
              onChange={() => handleSupplementToggle(sup.key)}
            />
            <span className="text-aria-text font-sans text-sm">{sup.label}</span>
          </label>
        ))}
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
