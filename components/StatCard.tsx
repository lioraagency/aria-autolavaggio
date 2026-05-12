interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  pulse?: boolean
  glow?: boolean
  onClick?: () => void
}

export default function StatCard({
  label,
  value,
  sub,
  accent,
  pulse,
  glow,
  onClick,
}: StatCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
      className={[
        "bg-aria-surface rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] flex flex-col gap-0",
        onClick ? "card-press cursor-pointer" : "",
        glow ? "animate-glow-green" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-[10px] text-aria-muted font-condensed uppercase tracking-widest leading-none">
        {label}
      </p>
      <p
        className={[
          "font-condensed font-black text-2xl tracking-tight mt-1",
          accent ? "text-aria-accent" : "text-aria-text",
          pulse ? "animate-pulse2" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-aria-muted mt-0.5">{sub}</p>
      )}
    </div>
  )
}
