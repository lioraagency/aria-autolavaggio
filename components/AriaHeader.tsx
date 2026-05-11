import Link from "next/link";

interface AriaHeaderProps {
  userName?: string;
  alertCount?: number;
}

export default function AriaHeader({ userName, alertCount = 0 }: AriaHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-2">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-condensed font-black text-xl uppercase tracking-[0.05em] text-aria-text leading-none">
          ARIA
        </span>
        <span className="text-aria-muted text-xs font-sans leading-none mt-0.5">
          · Autolavaggio
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Greeting */}
        {userName && (
          <span className="text-aria-dim text-sm font-sans">
            Bonjour, <span className="text-aria-text font-medium">{userName}</span>
          </span>
        )}

        {/* Bell */}
        <Link
          href="/aria/alertes"
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-aria-surface border border-aria-border"
          aria-label={alertCount > 0 ? `${alertCount} alertes` : "Alertes"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-aria-accent text-aria-bg text-[9px] font-bold flex items-center justify-center font-condensed">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
