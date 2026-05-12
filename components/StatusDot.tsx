"use client"

import { OperationalStatus, STATUS_COLORS } from "@/lib/types"

interface StatusDotProps {
  status: OperationalStatus
  size?: number
}

export default function StatusDot({ status, size = 10 }: StatusDotProps) {
  const color = STATUS_COLORS[status]
  const shouldPulse = status === "in_progress" || status === "ready"

  return (
    <span
      className={shouldPulse ? "animate-pulse2" : undefined}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  )
}
