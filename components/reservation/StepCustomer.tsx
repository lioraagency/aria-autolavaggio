'use client'

import { VehicleType } from '@/lib/types'

interface BookingFormState {
  serviceType: 'exterior' | 'interior' | 'complete' | null
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

function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function capitalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-zà-ÿ])/g, (_, sep, char) => sep + char.toUpperCase())
}

export default function StepCustomer({ state, onChange, onNext, onBack }: StepProps) {
  const phoneDigits = state.phone.replace(/\D/g, '')
  const canProceed =
    state.firstName.trim().length > 0 &&
    state.lastName.trim().length > 0 &&
    phoneDigits.length >= 10

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange({ phone: raw })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-condensed font-black text-3xl uppercase text-aria-text tracking-wide mb-1">
          Vos coordonnées
        </h2>
        <p className="text-aria-muted text-sm font-sans">Pour vous envoyer un rappel.</p>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="firstName" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={state.firstName}
            onChange={e => onChange({ firstName: e.target.value })}
            onBlur={e => onChange({ firstName: capitalizeName(e.target.value) })}
            placeholder="Marie"
            className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="lastName" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={state.lastName}
            onChange={e => onChange({ lastName: e.target.value })}
            onBlur={e => onChange({ lastName: capitalizeName(e.target.value) })}
            placeholder="Tremblay"
            className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={maskPhone(state.phone)}
          onChange={handlePhoneChange}
          placeholder="(XXX) XXX-XXXX"
          className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Courriel <span className="font-sans font-normal normal-case text-aria-dim">(optionnel)</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={state.email}
          onChange={e => onChange({ email: e.target.value })}
          placeholder="marie@exemple.com"
          className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isFirstVisit"
            className="sr-only"
            checked={state.isFirstVisit}
            onChange={() => onChange({ isFirstVisit: !state.isFirstVisit })}
          />
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              state.isFirstVisit
                ? 'bg-aria-accent border-aria-accent'
                : 'border-[rgba(255,255,255,0.12)] bg-aria-surface'
            }`}
          >
            {state.isFirstVisit && (
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M2 6l3 3 5-5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-aria-text font-sans text-sm leading-relaxed">
            Première visite chez Autolavaggio
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-[rgba(255,255,255,0.12)] text-aria-muted font-condensed font-black uppercase py-4 rounded-xl hover:text-aria-text transition-colors"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-[2] bg-aria-accent text-[#0A0A0A] font-condensed font-black uppercase text-lg py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Continuer →
        </button>
      </div>
    </div>
  )
}
