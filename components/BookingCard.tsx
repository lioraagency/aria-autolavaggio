"use client"

import { useState, useRef } from "react"
import StatusBadge from "@/components/StatusBadge"
import StatusPipeline from "@/components/StatusPipeline"
import { getCustomer, getVehicle } from "@/lib/mock-data"
import {
  type Booking,
  type OperationalStatus,
  SERVICE_LABELS,
  PAYMENT_LABELS,
  centsToDisplay,
} from "@/lib/types"

interface BookingCardProps {
  booking: Booking
  onTap?: (booking: Booking) => void
  onStatusAdvance?: (id: string, status: OperationalStatus) => void
  onCancel?: (id: string) => void
}

const STATUS_ORDER: OperationalStatus[] = [
  "scheduled",
  "arrived",
  "in_progress",
  "drying",
  "quality_check",
  "ready",
  "picked_up",
]

function getNextStatus(current: OperationalStatus): OperationalStatus | null {
  const idx = STATUS_ORDER.indexOf(current)
  if (idx === -1 || idx >= STATUS_ORDER.length - 1) return null
  return STATUS_ORDER[idx + 1]
}

const PAYMENT_DOT_COLORS: Record<string, string> = {
  unpaid: "bg-aria-dim",
  pending: "bg-aria-warning",
  paid: "bg-aria-success",
  refunded: "bg-aria-muted",
}

const SERVICE_ICONS: Record<string, string> = {
  exterior: "🚗",
  interior: "🧹",
  complete: "✨",
}

export default function BookingCard({
  booking,
  onTap,
  onStatusAdvance,
  onCancel,
}: BookingCardProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const triggered = useRef(false)

  const customer = getCustomer(booking.customerId)
  const vehicle = getVehicle(booking.vehicleId)

  const timeStr = new Date(booking.scheduledAt).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const nextStatus = getNextStatus(booking.operationalStatus)

  /* ── Touch swipe handlers ─────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setSwiping(true)
    triggered.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    setSwipeX(Math.max(-100, Math.min(100, dx)))
  }

  const handleTouchEnd = () => {
    if (!triggered.current) {
      if (swipeX < -60 && onCancel) {
        triggered.current = true
        onCancel(booking.id)
      } else if (swipeX > 60 && onStatusAdvance && nextStatus) {
        triggered.current = true
        onStatusAdvance(booking.id, nextStatus)
      }
    }
    setSwipeX(0)
    setSwiping(false)
    touchStartX.current = null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2">
      {/* Left reveal — advance status */}
      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-aria-accent/20 rounded-l-2xl">
        <span className="text-aria-accent text-xs font-condensed uppercase tracking-wider">
          Avancer
        </span>
      </div>
      {/* Right reveal — cancel */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-aria-danger/20 rounded-r-2xl">
        <span className="text-aria-danger text-xs font-condensed uppercase tracking-wider">
          Annuler
        </span>
      </div>

      {/* Card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${timeStr} — ${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`}
        onClick={() => onTap?.(booking)}
        onKeyDown={(e) => e.key === "Enter" && onTap?.(booking)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? "none" : "transform 0.25s ease-out",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        className="card-press bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-2xl p-[18px] select-none cursor-pointer"
      >
        {/* Row 1: time + status badge */}
        <div className="flex justify-between items-center">
          <span className="font-condensed font-bold text-[28px] text-aria-text leading-none">
            {timeStr}
          </span>
          <StatusBadge status={booking.operationalStatus} />
        </div>

        {/* Row 2: customer name + service */}
        <div className="flex justify-between items-center mt-2">
          <span className="font-sans font-medium text-[16px] text-aria-text">
            {customer
              ? `${customer.firstName} ${customer.lastName}`
              : "Client inconnu"}
          </span>
          <span className="flex items-center gap-1 text-xs text-aria-muted">
            <span>{SERVICE_ICONS[booking.serviceType] ?? "🚙"}</span>
            <span>{SERVICE_LABELS[booking.serviceType]}</span>
          </span>
        </div>

        {/* Row 3: vehicle info */}
        <div className="mt-1 text-[13px] text-aria-muted">
          {vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model} · ${vehicle.color}`
            : "Véhicule inconnu"}
        </div>

        {/* Row 4: status pipeline */}
        <div className="mt-2">
          <StatusPipeline status={booking.operationalStatus} compact />
        </div>

        {/* Row 5: payment + price */}
        <div className="flex justify-between items-center mt-2">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${PAYMENT_DOT_COLORS[booking.paymentStatus] ?? "bg-aria-dim"}`}
            />
            <span className="text-[11px] text-aria-muted">
              {PAYMENT_LABELS[booking.paymentStatus]}
            </span>
          </span>
          <span className="font-condensed font-black text-aria-accent text-lg">
            {centsToDisplay(booking.price)}
          </span>
        </div>
      </div>
    </div>
  )
}
