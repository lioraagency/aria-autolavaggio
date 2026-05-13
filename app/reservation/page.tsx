'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ServiceType, VehicleType } from '@/lib/types'
import StepService from '@/components/reservation/StepService'
import StepVehicle from '@/components/reservation/StepVehicle'
import StepDateTime from '@/components/reservation/StepDateTime'
import StepCustomer from '@/components/reservation/StepCustomer'
import StepConfirm from '@/components/reservation/StepConfirm'

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

const INITIAL_STATE: BookingFormState = {
  serviceType: null,
  supplements: [],
  totalPrice: 0,
  vehicleType: 'sedan',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: new Date().getFullYear(),
  vehicleColor: 'Noir',
  vehicleNotes: '',
  date: '',
  time: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  smsOptIn: true,
  isFirstVisit: false,
}

const STEP_LABELS = [
  'Choisir un service',
  'Votre véhicule',
  'Date et heure',
  'Vos coordonnées',
  'Confirmation',
]

export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formState, setFormState] = useState<BookingFormState>(INITIAL_STATE)

  function handleChange(updates: Partial<BookingFormState>) {
    setFormState(prev => ({ ...prev, ...updates }))
  }

  function handleNext() {
    if (currentStep < 5) setCurrentStep(s => s + 1)
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep(s => s - 1)
  }

  const stepProps = {
    state: formState,
    onChange: handleChange,
    onNext: handleNext,
    onBack: handleBack,
  }

  const progressPct = ((currentStep - 1) / 4) * 100

  return (
    <div className="min-h-screen bg-aria-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-aria-bg border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {currentStep === 1 ? (
            <Link
              href="/"
              className="w-8 h-8 flex items-center justify-center text-aria-muted hover:text-aria-text transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center text-aria-muted hover:text-aria-text transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}

          <div className="flex flex-col items-center flex-1 min-w-0">
            <span className="font-condensed font-black uppercase text-aria-text text-sm tracking-wider truncate">
              {STEP_LABELS[currentStep - 1]}
            </span>
          </div>

          <span className="text-aria-muted font-condensed text-sm shrink-0">
            Étape {currentStep} sur 5
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-aria-surface">
          <div
            className="h-1 bg-aria-accent transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div key={currentStep} className="animate-fade-up">
          {currentStep === 1 && <StepService {...stepProps} />}
          {currentStep === 2 && <StepVehicle {...stepProps} />}
          {currentStep === 3 && <StepDateTime {...stepProps} />}
          {currentStep === 4 && <StepCustomer {...stepProps} />}
          {currentStep === 5 && <StepConfirm {...stepProps} />}
        </div>
      </div>
    </div>
  )
}
