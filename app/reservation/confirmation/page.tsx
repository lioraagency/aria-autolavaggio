'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const num = searchParams.get('num') ?? ''

  function handleAddToCalendar() {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Autolavaggio - Lavage auto\nDTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDESCRIPTION:Votre réservation #${num} chez Autolavaggio\nLOCATION:2125 chemin Ste-Foy Québec\nEND:VEVENT\nEND:VCALENDAR`
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'autolavaggio.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-aria-bg flex flex-col items-center justify-center px-6">
      {/* Checkmark */}
      <div className="w-20 h-20 rounded-full border-2 border-aria-accent flex items-center justify-center mb-8 animate-glow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D5FC96"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="w-10 h-10"
        >
          <path
            d="M5 13l4 4L19 7"
            style={{
              strokeDasharray: 30,
              strokeDashoffset: 0,
              animation: 'dash 0.6s ease-out forwards',
            }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <h1 className="font-condensed font-black text-4xl uppercase text-aria-text text-center tracking-wide">
        Réservation confirmée
      </h1>

      {num && (
        <p className="text-aria-accent font-condensed font-black text-2xl mt-2">
          N° #{num}
        </p>
      )}

      <p className="text-aria-muted text-sm mt-4 text-center font-sans max-w-xs">
        Nous vous attendons pour votre rendez-vous.
      </p>

      <button
        type="button"
        onClick={handleAddToCalendar}
        className="border border-[rgba(255,255,255,0.12)] text-aria-text px-6 py-3 rounded-xl font-condensed uppercase tracking-wider text-sm mt-8 hover:border-[rgba(255,255,255,0.25)] transition-colors"
      >
        Ajouter à mon calendrier
      </button>


      <Link
        href="/"
        className="text-aria-muted text-sm mt-6 hover:text-aria-text transition-colors font-sans"
      >
        ← Retour à l&apos;accueil
      </Link>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-aria-bg flex items-center justify-center">
          <div className="text-aria-muted font-condensed">Chargement...</div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
