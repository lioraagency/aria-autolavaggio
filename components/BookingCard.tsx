"use client";
import { useState, useRef } from "react";
import type { Booking } from "@/lib/cal";

const SERVICE_COLORS: Record<string, string> = {
  "Service Complet":  "bg-aria-accent/10 text-aria-accent border-aria-accent/20",
  "Extérieur seul":   "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "Intérieur seul":   "bg-purple-500/10 text-purple-300 border-purple-500/20",
};

const STATUS_LABELS: Record<Booking["status"], string> = {
  confirmed:  "Confirmé",
  pending:    "En attente",
  cancelled:  "Annulé",
};

interface BookingCardProps {
  booking:    Booking;
  onConfirm?: (id: string) => void;
  onCancel?:  (id: string) => void;
}

export default function BookingCard({ booking, onConfirm, onCancel }: BookingCardProps) {
  const [showModal,  setShowModal]  = useState(false);
  const [swipeX,     setSwipeX]     = useState(0);
  const [swiping,    setSwiping]    = useState(false);
  const touchStartX = useRef<number | null>(null);

  const colorClass = SERVICE_COLORS[booking.service] ?? "bg-aria-surface text-aria-dim border-aria-border";

  /* ── Touch swipe handlers ─────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    setSwipeX(Math.max(-80, Math.min(80, dx)));
  };
  const handleTouchEnd = () => {
    if (swipeX < -60 && onCancel)  onCancel(booking.id);
    if (swipeX >  60 && onConfirm) onConfirm(booking.id);
    setSwipeX(0);
    setSwiping(false);
    touchStartX.current = null;
  };

  return (
    <>
      {/* Swipe hint background */}
      <div className="relative overflow-hidden rounded-xl mb-2">
        {/* Left reveal (confirm) */}
        <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center bg-green-700/40 rounded-l-xl">
          <span className="text-green-300 text-xs font-condensed uppercase tracking-wider">✓</span>
        </div>
        {/* Right reveal (cancel) */}
        <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-red-700/40 rounded-r-xl">
          <span className="text-red-300 text-xs font-condensed uppercase tracking-wider">✕</span>
        </div>

        {/* Card */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${booking.startTime} — ${booking.clientName}, ${booking.service}`}
          onClick={() => setShowModal(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowModal(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? "none" : "transform 0.25s ease-out" }}
          className={`bg-aria-surface border border-aria-border rounded-xl p-4 cursor-pointer select-none ${
            booking.status === "cancelled" ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Time block */}
            <div className="flex-shrink-0 text-right min-w-[52px]">
              <span className="font-condensed font-black text-2xl text-aria-text leading-none tracking-tight">
                {booking.startTime}
              </span>
              <span className="block text-aria-muted text-[10px] mt-0.5">
                {booking.duration} min
              </span>
            </div>

            {/* Divider */}
            <div className="w-px bg-aria-border self-stretch mx-1" aria-hidden="true" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="font-condensed font-bold text-base text-aria-text uppercase tracking-wide truncate">
                  {booking.clientName}
                </p>
                {booking.status !== "confirmed" && (
                  <span className="text-[10px] font-condensed uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {STATUS_LABELS[booking.status]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-condensed uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorClass}`}>
                  {booking.service}
                </span>
                <span className="font-condensed font-black text-aria-accent text-sm">
                  {booking.price} $
                </span>
              </div>

              {booking.note && (
                <p className="mt-1.5 text-xs text-aria-muted italic truncate">
                  {booking.note}
                </p>
              )}
            </div>

            {/* Chevron */}
            <svg className="flex-shrink-0 text-aria-muted mt-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Détails du rendez-vous"
        >
          <div
            className="w-full bg-aria-surface rounded-t-2xl p-6 pb-safe animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-aria-border rounded-full mx-auto mb-5" aria-hidden="true" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-condensed font-black text-2xl text-aria-text uppercase tracking-tight">
                  {booking.clientName}
                </h2>
                <p className="text-aria-muted text-sm">{booking.date}</p>
              </div>
              <span className="font-condensed font-black text-3xl text-aria-accent">
                {booking.price} $
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <Row label="Heure"    value={`${booking.startTime} — ${booking.endTime}`} />
              <Row label="Service"  value={booking.service} />
              <Row label="Durée"    value={`${booking.duration} min`} />
              <Row label="Statut"   value={STATUS_LABELS[booking.status]} />
              {booking.phone && <Row label="Téléphone" value={booking.phone} link={`tel:${booking.phone}`} />}
              {booking.note  && <Row label="Note"      value={booking.note} />}
            </div>

            <div className="flex gap-3">
              {onConfirm && booking.status !== "confirmed" && (
                <button
                  onClick={() => { onConfirm(booking.id); setShowModal(false); }}
                  className="flex-1 h-12 rounded-xl bg-aria-accent text-aria-bg font-condensed font-black uppercase tracking-wider text-sm active:opacity-80 transition-opacity"
                >
                  Confirmer
                </button>
              )}
              {onCancel && booking.status !== "cancelled" && (
                <button
                  onClick={() => { onCancel(booking.id); setShowModal(false); }}
                  className="flex-1 h-12 rounded-xl border border-red-500/40 text-red-400 font-condensed font-black uppercase tracking-wider text-sm active:opacity-80 transition-opacity"
                >
                  Annuler
                </button>
              )}
              {booking.phone && (
                <a
                  href={`tel:${booking.phone}`}
                  className="h-12 w-12 rounded-xl bg-aria-card border border-aria-border flex items-center justify-center text-aria-dim active:opacity-80 transition-opacity"
                  aria-label="Appeler"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 5.54 5.54l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </a>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-3 w-full h-11 text-aria-muted text-sm font-condensed uppercase tracking-widest"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-aria-border last:border-0">
      <span className="text-aria-muted text-xs font-condensed uppercase tracking-wider">{label}</span>
      {link ? (
        <a href={link} className="text-aria-accent text-sm font-medium">{value}</a>
      ) : (
        <span className="text-aria-text text-sm">{value}</span>
      )}
    </div>
  );
}
