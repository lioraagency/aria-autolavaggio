"use client"

import {
  OperationalStatus,
  STATUS_COLORS,
  OPERATIONAL_STATUS_LABELS,
  OPERATIONAL_PIPELINE,
} from "@/lib/types"

interface StatusPipelineProps {
  status: OperationalStatus
  compact?: boolean
}

const ACCENT = "#D5FC96"
const ACCENT_DIM = "#D5FC9666" // 40% opacity
const STEP_DIM = "#5A5A5A"
const DANGER = "#FF453A"

export default function StatusPipeline({ status, compact = false }: StatusPipelineProps) {
  const isCancelled = status === "cancelled" || status === "no_show"
  const currentIndex = OPERATIONAL_PIPELINE.indexOf(status)

  if (isCancelled) {
    if (compact) {
      return (
        <div
          className="w-full h-1 rounded-full"
          style={{ background: DANGER }}
        />
      )
    }
    return (
      <div
        className="w-full h-1.5 rounded-full"
        style={{ background: DANGER }}
      />
    )
  }

  if (compact) {
    return (
      <div className="flex items-center w-full gap-0.5">
        {OPERATIONAL_PIPELINE.map((step, i) => {
          const isActive = i === currentIndex
          const isPast = i < currentIndex

          const segmentColor = isPast
            ? ACCENT_DIM
            : isActive
            ? STATUS_COLORS[step]
            : STEP_DIM

          const isLast = i === OPERATIONAL_PIPELINE.length - 1

          return (
            <div key={step} className="flex items-center" style={{ flex: isLast ? "0 0 auto" : 1 }}>
              {/* Dot at active step, thin line otherwise */}
              {isActive ? (
                <span
                  className={step === "in_progress" ? "animate-pulse2" : undefined}
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: segmentColor,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: segmentColor,
                    flexShrink: 0,
                  }}
                />
              )}
              {/* Connector line (not after last) */}
              {!isLast && (
                <span
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor:
                      isPast || isActive ? ACCENT_DIM : STEP_DIM,
                    display: "inline-block",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Full mode: dots with labels below
  return (
    <div className="flex items-start w-full">
      {OPERATIONAL_PIPELINE.map((step, i) => {
        const isActive = i === currentIndex
        const isPast = i < currentIndex
        const isLast = i === OPERATIONAL_PIPELINE.length - 1

        const dotColor = isPast
          ? ACCENT_DIM
          : isActive
          ? STATUS_COLORS[step]
          : STEP_DIM

        const lineColor = isPast ? ACCENT_DIM : STEP_DIM

        const shouldGlow =
          isActive && (step === "in_progress" || step === "ready")

        return (
          <div
            key={step}
            className="flex flex-col items-center"
            style={{ flex: isLast ? "0 0 auto" : 1 }}
          >
            <div className="flex items-center w-full">
              {/* Dot */}
              <span
                className={shouldGlow ? "animate-pulse2" : undefined}
                style={{
                  display: "inline-block",
                  width: isActive ? 10 : 8,
                  height: isActive ? 10 : 8,
                  borderRadius: "50%",
                  backgroundColor: dotColor,
                  flexShrink: 0,
                  boxShadow:
                    shouldGlow
                      ? `0 0 6px 2px ${dotColor}88`
                      : undefined,
                }}
              />
              {/* Connector */}
              {!isLast && (
                <span
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: lineColor,
                    display: "inline-block",
                  }}
                />
              )}
            </div>
            {/* Label */}
            <span
              className="font-condensed uppercase tracking-wider mt-1 text-center"
              style={{
                fontSize: 9,
                color: isActive ? dotColor : isPast ? ACCENT_DIM : STEP_DIM,
                whiteSpace: "nowrap",
              }}
            >
              {OPERATIONAL_STATUS_LABELS[step]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
