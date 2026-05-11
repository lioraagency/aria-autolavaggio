interface StatCardProps {
  label:    string;
  value:    string;
  sub?:     string;
  accent?:  boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="flex-1 min-w-0 bg-aria-surface rounded-xl p-4 border border-aria-border flex flex-col gap-1">
      <p className="text-aria-muted text-xs font-condensed uppercase tracking-widest leading-none">
        {label}
      </p>
      <p className={`font-condensed font-black text-2xl leading-tight tracking-tight ${accent ? "text-aria-accent" : "text-aria-text"}`}>
        {value}
      </p>
      {sub && (
        <p className="text-aria-muted text-xs leading-none">{sub}</p>
      )}
    </div>
  );
}
