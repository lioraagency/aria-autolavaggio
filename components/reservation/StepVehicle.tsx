'use client'

import { useRef, useState } from 'react'
import { VehicleType } from '@/lib/types'
import { computeTotal } from '@/lib/pricing'

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
  { label: 'Berline',     value: 'sedan'      },
  { label: 'VUS compact', value: 'suv_compact' },
  { label: 'VUS',         value: 'suv'         },
  { label: 'Pick-up',     value: 'truck'       },
]

const COLORS: { label: string; dot: string }[] = [
  { label: 'Noir', dot: '#1A1A1A' },
  { label: 'Blanc', dot: '#F5F5F5' },
  { label: 'Gris', dot: '#8A8A8A' },
  { label: 'Argent', dot: '#C0C0C0' },
  { label: 'Rouge', dot: '#CC3333' },
  { label: 'Bleu', dot: '#3366CC' },
  { label: 'Vert', dot: '#336633' },
  { label: 'Autre', dot: '#D5FC96' },
]

const TOP_SELLERS = ['Toyota','Honda','Ford','GMC','Mazda','Hyundai','Kia','Volkswagen','Subaru','Nissan','Chevrolet','Tesla','Volvo','Mitsubishi','Ram','Jeep','Dodge']
const LUXURY = ['BMW','Mercedes-Benz','Audi','Lexus','Porsche','Cadillac','Lincoln','Infiniti','Acura','Genesis','Land Rover','Jaguar','Maserati','Bentley','Rolls-Royce','Lamborghini','Ferrari','Lotus','McLaren','Aston Martin','Bugatti']

type MakeGroup = { group: string; items: string[] }
const MAKES_GROUPS: MakeGroup[] = [
  { group: 'Populaires', items: TOP_SELLERS },
  { group: 'Luxe / Premium', items: LUXURY },
]

const INITIAL_CHIP_FOR_TYPE: Record<VehicleType, string> = {
  sedan:       'Berline',
  suv_compact: 'VUS compact',
  suv:         'VUS',
  truck:       'Pick-up',
  compact:     'Berline',
}

export default function StepVehicle({ state, onChange, onNext, onBack }: StepProps) {
  const [selectedChipLabel, setSelectedChipLabel] = useState<string>(
    INITIAL_CHIP_FOR_TYPE[state.vehicleType]
  )
  const [makesOpen, setMakesOpen] = useState(false)
  const [makesQuery, setMakesQuery] = useState(state.vehicleMake)
  const makesRef = useRef<HTMLDivElement>(null)

  const filteredGroups: MakeGroup[] = makesQuery.trim()
    ? MAKES_GROUPS.map(g => ({
        group: g.group,
        items: g.items.filter(m => m.toLowerCase().includes(makesQuery.toLowerCase())),
      })).filter(g => g.items.length > 0)
    : MAKES_GROUPS

  function selectMake(make: string) {
    setMakesQuery(make)
    onChange({ vehicleMake: make })
    setMakesOpen(false)
  }

  function handleChipSelect(chip: { label: string; value: VehicleType }) {
    setSelectedChipLabel(chip.label)
    onChange({
      vehicleType: chip.value,
      totalPrice: computeTotal(state.serviceType, state.supplements, chip.value),
    })
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
      <div className="flex flex-col gap-2" ref={makesRef}>
        <label htmlFor="vehicleMake" className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
          Marque
        </label>
        <div className="relative">
          <input
            type="text"
            id="vehicleMake"
            name="vehicleMake"
            autoComplete="off"
            value={makesQuery}
            onChange={e => {
              setMakesQuery(e.target.value)
              onChange({ vehicleMake: e.target.value })
              setMakesOpen(true)
            }}
            onFocus={() => setMakesOpen(true)}
            onBlur={() => setTimeout(() => setMakesOpen(false), 150)}
            placeholder="Toyota, Honda, Ford..."
            className="bg-aria-surface border border-[rgba(255,255,255,0.12)] rounded-xl px-4 py-3 text-aria-text font-sans focus:outline-none focus:border-aria-accent/50 w-full"
          />
          {makesOpen && filteredGroups.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '260px', overflowY: 'auto' }}
            >
              {filteredGroups.map((group, gi) => (
                <li key={group.group}>
                  {gi > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0' }} />
                  )}
                  <div className="px-4 pt-2 pb-1 font-condensed font-black uppercase text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {group.group}
                  </div>
                  <ul>
                    {group.items.map(make => (
                      <li
                        key={make}
                        role="option"
                        aria-selected={state.vehicleMake === make}
                        onMouseDown={() => selectMake(make)}
                        className="px-4 py-2.5 cursor-pointer font-sans text-sm transition-colors"
                        style={{
                          color: state.vehicleMake === make ? '#0A0A0A' : 'rgba(255,255,255,0.80)',
                          background: state.vehicleMake === make ? '#D5FC96' : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (state.vehicleMake !== make) {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(212,255,63,0.12)'
                            ;(e.currentTarget as HTMLElement).style.color = '#D5FC96'
                          }
                        }}
                        onMouseLeave={e => {
                          if (state.vehicleMake !== make) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.80)'
                          }
                        }}
                      >
                        {make}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
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
          Demandes spéciales <span className="font-sans font-normal normal-case text-aria-dim">(optionnel)</span>
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
