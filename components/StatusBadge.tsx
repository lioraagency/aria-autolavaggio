"use client"

import { OperationalStatus, STATUS_COLORS, OPERATIONAL_STATUS_LABELS } from "@/lib/types"
import StatusDot from "./StatusDot"

interface StatusBadgeProps {
  status: OperationalStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status]
  const label = OPERATIONAL_STATUS_LABELS[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-condensed uppercase tracking-wider text-xs ${className ?? ""}`}
      style={{
        background: `${color}26`,
        border: `1px solid ${color}66`,
        color,
      }}
    >
      <StatusDot status={status} size={8} />
      {label}
    </span>
  )
}
