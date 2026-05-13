'use client'

import { useState } from 'react'
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

const VEHICLE_CHIPS: { label: string; value: VehicleType }[] = [
  { label: 'Berline', value: 'sedan' },
  { label: 'VUS Compact', value: 'suv' },
  { label: 'VUS', value: 'suv' },
  { label: 'Pickup', value: 'truck' },
  { label: 'Compacte', value: 'compact' },
]

const COLORS: { label: string; dot: string }[] = [
  { label: 'Noir', dot: '#1A1A1A' },
  { label: 'Blanc', dot: '#F5F5F5' },
  { label: 'Gris', dot: '#8A8A8A' },
  { label: 'Argent', dot: '#C0C0C0' },
  { label: 'Rouge', dot: '#CC3333' },
  { label: 'Bleu', dot: '#3366CC' },
  { label: 'Vert', dot: '#336633' },
  { label: 'Autre', dot: '#D4FF3F' },
]

const MAKES = ['Toyota','Honda','Ford','GMC','Mazda','Hyundai','Kia','Volkswagen','BMW','Mercedes','Audi','Lexus','Subaru','Nissan','Chevrolet','Tesla','Volvo']

const INITIAL_CHIP_FOR_TYPE: Record<VehicleType, string> = {
  sedan: 'Berline',
  suv: 'VUS',
  truck: 'Pickup',
  compact: 'Compacte',
}

export default function StepVehicle({ state, onChange, onNext, onBack }: StepProps) {
  const [selectedChipLabel, setSelectedChipLabel] = useState<string>(
    INITIAL_CHIP_FOR_TYPE[state.vehicleType]
  )

  function handleChipSelect(chip: { label: string; value: VehicleType }) {
    setSelectedChipLabel(chip.label)
    onChange({ vehicleType: chip.value })
  }

  const canProceed = state.vehicleMake.trim().length > 0 && state.vehicleModel.trim().length > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-condensed font-black text-3xl uppercase text-aria-text tracking-wide mb-1">
          Votre véhicule
        </h2>
        <p className="text-aria-muted text-sm font-sans">Dites-nous ce que vous amenez.</p>
      </div>

      {/* Vehicle type chips */}
      <div className="flex flex-col gap-2">
        <span className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Type de véhicule
        </span>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_CHIPS.map(chip => {
            const selected = selectedChipLabel === chip.label
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipSelect(chip)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  selected
                    ? 'bg-aria-accent text-[#0A0A0A] font-condensed font-black'
                    : 'bg-aria-surface border border-[rgba(255,255,255,0.06)] text-aria-muted font-condensed'
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Make */}
      <div className="flex flex-col gap-2">
        <label htmlFor="vehicleMake" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Marque
        </label>
        <input
          type="text"
          id="vehicleMake"
          name="vehicleMake"
          list="makes-list"
          value={state.vehicleMake}
          onChange={e => onChange({ vehicleMake: e.target.value })}
          placeholder="Toyota, Honda, Ford..."
          className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
        />
        <datalist id="makes-list">
          {MAKES.map(m => <option key={m} value={m} />)}
        </datalist>
      </div>

      {/* Model */}
      <div className="flex flex-col gap-2">
        <label htmlFor="vehicleModel" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Modèle
        </label>
        <input
          type="text"
          id="vehicleModel"
          name="vehicleModel"
          value={state.vehicleModel}
          onChange={e => onChange({ vehicleModel: e.target.value })}
          placeholder="Corolla, Civic, F-150..."
          className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
        />
      </div>

      {/* Year */}
      <div className="flex flex-col gap-2">
        <label htmlFor="vehicleYear" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Année
        </label>
        <input
          type="number"
          id="vehicleYear"
          name="vehicleYear"
          min={1990}
          max={2026}
          value={state.vehicleYear}
          onChange={e => onChange({ vehicleYear: parseInt(e.target.value, 10) })}
          className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
        />
      </div>

      {/* Color chips */}
      <div className="flex flex-col gap-2">
        <span className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Couleur
        </span>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => {
            const selected = state.vehicleColor === color.label
            return (
              <button
                key={color.label}
                type="button"
                onClick={() => onChange({ vehicleColor: color.label })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  selected
                    ? 'bg-aria-accent text-[#0A0A0A] font-condensed font-black'
                    : 'bg-aria-surface border border-[rgba(255,255,255,0.06)] text-aria-muted font-condensed'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-[rgba(255,255,255,0.12)] shrink-0"
                  style={{ backgroundColor: color.dot }}
                />
                {color.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label htmlFor="vehicleNotes" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Notes <span className="font-sans font-normal normal-case text-aria-dim">(optionnel)</span>
        </label>
        <textarea
          id="vehicleNotes"
          name="vehicleNotes"
          value={state.vehicleNotes}
          onChange={e => onChange({ vehicleNotes: e.target.value })}
          placeholder="Quelque chose à savoir? Tache, odeur, zone spéciale..."
          rows={3}
          className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full resize-none"
        />
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
