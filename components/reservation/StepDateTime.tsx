'use client'

import { useState, useEffect } from 'react'
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

const HOURS_BY_DOW: Record<number, { open: number; close: number } | null> = {
  0: null,
  1: { open: 9, close: 17 },
  2: { open: 9, close: 17 },
  3: { open: 9, close: 21 },
  4: { open: 9, close: 21 },
  5: { open: 9, close: 17 },
  6: null,
}

// Mock unavailable slots — Tuesday slots at 10:00 and 14:00
const MOCK_FULL_SLOTS: Record<number, string[]> = {
  2: ['10:00', '14:00'],
}

function getTimeSlots(dow: number): { time: string; full: boolean }[] {
  const hours = HOURS_BY_DOW[dow]
  if (!hours) return []
  const slots: { time: string; full: boolean }[] = []
  const lastSlotHour = hours.close - 1
  for (let h = hours.open; h < lastSlotHour; h++) {
    for (const m of [0]) {
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      slots.push({ time: label, full: false })
    }
  }
  // Last hour — add :00 only (close - 1 hour)
  const hLast = lastSlotHour
  slots.push({ time: `${String(hLast).padStart(2, '0')}:00`, full: false })
  return slots
}

function padded(n: number) {
  return String(n).padStart(2, '0')
}

function dateToStr(y: number, m: number, d: number): string {
  return `${y}-${padded(m + 1)}-${padded(d)}`
}

const DOW_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function getCalendarWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d))

  // Pad end
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export default function StepDateTime({ state, onChange, onNext, onBack }: StepProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [displayMonth, setDisplayMonth] = useState<{ year: number; month: number }>({
    year: today.getFullYear(),
    month: today.getMonth(),
  })

  const [apiFullSlots, setApiFullSlots] = useState<string[]>([])
  const [apiAvailableSlots, setApiAvailableSlots] = useState<string[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (!state.date) {
      setApiFullSlots([])
      return
    }
    let cancelled = false
    setApiAvailableSlots(null)
    setLoadingSlots(true)
    fetch(`/api/availability?date=${state.date}&service=${state.serviceType ?? "complete"}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          if (Array.isArray(d.availableSlots)) {
            setApiAvailableSlots(d.availableSlots)
          }
          if (Array.isArray(d.fullSlots)) {
            setApiFullSlots(d.fullSlots)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setApiFullSlots([])
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })
    return () => {
      cancelled = true
    }
  }, [state.date])

  const baseMonth = { year: today.getFullYear(), month: today.getMonth() }
  const maxMonth = { year: today.getMonth() >= 10 ? today.getFullYear() + 1 : today.getFullYear(), month: (today.getMonth() + 2) % 12 }

  function canGoPrev() {
    return displayMonth.year > baseMonth.year || displayMonth.month > baseMonth.month
  }

  function canGoNext() {
    return displayMonth.year < maxMonth.year || (displayMonth.year === maxMonth.year && displayMonth.month < maxMonth.month)
  }

  function goPrev() {
    if (!canGoPrev()) return
    setDisplayMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  function goNext() {
    if (!canGoNext()) return
    setDisplayMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const weeks = getCalendarWeeks(displayMonth.year, displayMonth.month)

  function handleDayClick(date: Date) {
    const dow = date.getDay()
    if (HOURS_BY_DOW[dow] === null) return
    if (date < today) return
    const str = dateToStr(date.getFullYear(), date.getMonth(), date.getDate())
    onChange({ date: str, time: '' })
  }

  const selectedDate = state.date ? new Date(state.date + 'T00:00:00') : null
  const selectedDow = selectedDate ? selectedDate.getDay() : null
  const slots = selectedDow !== null ? getTimeSlots(selectedDow) : []

  const slotsWithFull = slots
    .filter(s => apiAvailableSlots === null || apiAvailableSlots.includes(s.time))
    .map(s => ({
      ...s,
      full: apiFullSlots.includes(s.time),
    }))

  const canProceed = state.date.length > 0 && state.time.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-condensed font-black text-3xl uppercase text-aria-text tracking-wide mb-1">
          Date et heure
        </h2>
        <p className="text-aria-muted text-sm font-sans">Choisissez quand vous passez.</p>
      </div>

      {/* Calendar */}
      <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev()}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-aria-muted hover:text-aria-text disabled:opacity-30 transition-colors"
          >
            ‹
          </button>
          <span className="font-condensed font-black uppercase text-aria-text tracking-wide">
            {MONTH_LABELS[displayMonth.month]} {displayMonth.year}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext()}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-aria-muted hover:text-aria-text disabled:opacity-30 transition-colors"
          >
            ›
          </button>
        </div>

        {/* DOW headers */}
        <div className="grid grid-cols-7 mb-2">
          {DOW_LABELS.map(d => (
            <div key={d} className="text-center text-aria-dim font-condensed text-xs uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((date, di) => {
              if (!date) {
                return <div key={di} className="h-10" />
              }
              const dow = date.getDay()
              const isPast = date < today
              const isClosed = HOURS_BY_DOW[dow] === null
              const isToday = date.getTime() === today.getTime()
              const isSelected =
                selectedDate !== null &&
                date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getDate() === selectedDate.getDate()
              const disabled = isPast || isClosed

              return (
                <button
                  key={di}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(date)}
                  className={`h-10 w-full flex items-center justify-center text-sm rounded-lg transition-all
                    ${isSelected ? 'bg-aria-accent text-[#0A0A0A] font-black' : ''}
                    ${!isSelected && !disabled ? 'text-aria-text hover:bg-aria-accent/10 cursor-pointer' : ''}
                    ${disabled ? 'text-aria-dim opacity-50 cursor-not-allowed' : ''}
                    ${isToday && !isSelected ? 'underline' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Hours legend */}
      <div className="flex gap-4 text-xs text-aria-muted font-sans">
        <span>Lun–Mar–Ven : 9h–17h</span>
        <span>Mer–Jeu : 9h–21h</span>
        <span>Sam–Dim : Fermé</span>
      </div>

      {/* Time slots */}
      {state.date && (
        <div className="flex flex-col gap-3">
          <span className="font-condensed font-black uppercase text-aria-muted text-sm tracking-wider">
            Heure disponible
          </span>
          {slotsWithFull.length === 0 ? (
            <p className="text-aria-dim text-sm font-sans">Aucune plage disponible ce jour.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slotsWithFull.map(slot => {
                const selected = state.time === slot.time
                const unavailable = slot.full
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={unavailable}
                    onClick={() => !unavailable && onChange({ time: slot.time })}
                    className={`py-2 rounded-lg text-sm font-condensed font-black uppercase transition-all relative
                      ${selected ? 'bg-aria-accent text-[#0A0A0A]' : ''}
                      ${!selected && !unavailable ? 'bg-aria-surface border border-[rgba(255,255,255,0.06)] text-aria-text hover:border-aria-accent/30' : ''}
                      ${unavailable ? 'bg-aria-surface border border-[rgba(255,255,255,0.06)] text-aria-dim opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {slot.time}
                    {unavailable && (
                      <span className="block text-[9px] font-sans font-normal normal-case text-aria-dim leading-none mt-0.5">
                        Complet
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

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
