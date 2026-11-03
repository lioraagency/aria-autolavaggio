"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { HOURS_BY_DOW, dayOfWeek } from "@/lib/hours";
import { businessDateKey } from "@/lib/time";

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DOW_HEADERS = ["L","M","M","J","V","S","D"];
// Pression : 120 ms, courbe ease-out marquée ; couleurs : fondu 150 ms
const CELL_TRANSITION =
  "transform 120ms cubic-bezier(0.23, 1, 0.32, 1), background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease";

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function withToggled(set: Set<string>, key: string, present: boolean) {
  const n = new Set(set);
  if (present) n.add(key); else n.delete(key);
  return n;
}

export default function DispoClient() {
  const supabase = getBrowserSupabase();
  // undefined = vérification en cours, null = pas connecté
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-aria-bg flex flex-col px-5 pt-safe">
      <header className="pt-8 pb-6 text-center">
        <h1 className="font-condensed font-black text-[2.25rem] uppercase tracking-[0.05em] text-aria-text leading-none">
          Disponibilités
        </h1>
        <p className="font-condensed text-aria-muted text-xs uppercase tracking-[0.15em] mt-2">
          Autolavaggio
        </p>
      </header>

      {session === undefined && (
        <p className="text-center text-aria-muted text-sm mt-10">Chargement…</p>
      )}
      {session === null && <LoginForm />}
      {session && <Calendar session={session} />}

      <footer className="mt-auto py-6 pb-safe text-center">
        <p className="text-aria-muted text-[11px] font-condensed uppercase tracking-[0.12em]">by LIORA</p>
      </footer>
    </div>
  );
}

// ── Connexion par lien magique ─────────────────────────────────────────────────

function LoginForm() {
  const supabase = getBrowserSupabase();
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError]   = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/aria/dispo`,
      },
    });
    if (err) {
      setStatus("idle");
      setError(err.status === 429
        ? "Trop de demandes. Réessayez dans quelques minutes."
        : "Cette adresse n'est pas autorisée.");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="bg-aria-surface border border-aria-border rounded-2xl p-6 text-center animate-fade-up">
        <p className="text-aria-text font-semibold">Lien envoyé</p>
        <p className="text-aria-muted text-sm mt-2 leading-relaxed">
          Ouvrez le courriel envoyé à <span className="text-aria-text">{email.trim()}</span> et touchez le lien pour vous connecter.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-aria-muted text-xs font-condensed uppercase tracking-[0.12em] underline underline-offset-4"
        >
          Changer d&apos;adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-aria-muted text-xs font-condensed uppercase tracking-[0.12em]">
        Adresse courriel
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="h-14 rounded-xl bg-aria-surface border border-aria-border-strong px-4 text-aria-text text-base outline-none focus:border-aria-accent"
      />
      {error && <p className="text-aria-danger text-sm">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-14 rounded-xl bg-aria-accent text-aria-bg font-condensed font-black uppercase tracking-[0.08em] text-lg disabled:opacity-50"
      >
        {status === "sending" ? "Envoi…" : "Recevoir le lien"}
      </button>
    </form>
  );
}

// ── Calendrier : un tap = bloquer / débloquer ─────────────────────────────────

function Calendar({ session }: { session: Session }) {
  const supabase = getBrowserSupabase();
  const todayKey = businessDateKey(new Date());
  const [ty, tm] = todayKey.split("-").map(Number);

  const [view, setView]       = useState({ year: ty, month: tm - 1 });
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast]     = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [slideDir, setSlideDir]   = useState<"next" | "prev" | null>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    const { data, error } = await supabase
      .from("blocked_dates")
      .select("date")
      .gte("date", dateKey(ty, tm - 1, 1));
    if (error) { setLoadError(true); return; }
    setBlocked(new Set((data ?? []).map(r => r.date as string)));
  }, [supabase, ty, tm]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function toggle(key: string) {
    if (pending.has(key)) return;
    const wasBlocked = blocked.has(key);

    // Mise à jour immédiate, annulée si l'écriture échoue
    setBlocked(prev => withToggled(prev, key, !wasBlocked));
    setPending(prev => new Set(prev).add(key));

    const { error } = wasBlocked
      ? await supabase.from("blocked_dates").delete().eq("date", key)
      : await supabase.from("blocked_dates").insert({ date: key });

    // 23505 = déjà bloquée (double tap ou autre appareil) : l'état voulu est atteint
    if (error && error.code !== "23505") {
      setBlocked(prev => withToggled(prev, key, wasBlocked));
      setToast("Échec de l'enregistrement. Réessayez.");
    } else {
      setConfirmed(prev => withToggled(prev, key, true));
      setTimeout(() => setConfirmed(prev => withToggled(prev, key, false)), 600);
    }
    setPending(prev => { const n = new Set(prev); n.delete(key); return n; });
  }

  const { year, month } = view;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstDow    = dayOfWeek(dateKey(year, month, 1));
  const blanks      = firstDow === 0 ? 6 : firstDow - 1;
  const isCurrentMonth = year === ty && month === tm - 1;

  const shiftMonth = (delta: number) => {
    setSlideDir(delta > 0 ? "next" : "prev");
    setView(({ year, month }) => {
      const m = month + delta;
      return { year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const blockedThisMonth = Array.from(blocked).filter(k => k.startsWith(`${year}-${pad(month + 1)}-`)).length;

  const slideClass = slideDir === "next"
    ? "motion-safe:animate-month-next motion-reduce:animate-fade-in"
    : slideDir === "prev"
      ? "motion-safe:animate-month-prev motion-reduce:animate-fade-in"
      : "";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <p className="text-center text-aria-muted text-[13px]">
        Touchez une date pour la bloquer ou la débloquer.
      </p>

      <div className="bg-aria-surface border border-aria-border rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            disabled={isCurrentMonth}
            aria-label="Mois précédent"
            className="w-11 h-11 -ml-1 rounded-xl text-aria-text text-3xl leading-none active:scale-[0.96] disabled:opacity-20"
            style={{ transition: CELL_TRANSITION }}
          >
            ‹
          </button>
          <p className="font-condensed font-bold uppercase tracking-[0.08em] text-aria-text text-2xl">
            {MONTHS_FR[month]} {year}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mois suivant"
            className="w-11 h-11 -mr-1 rounded-xl text-aria-text text-3xl leading-none active:scale-[0.96]"
            style={{ transition: CELL_TRANSITION }}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DOW_HEADERS.map((d, i) => (
            <p key={i} className="text-center text-[11px] text-aria-muted font-condensed uppercase tracking-wide">{d}</p>
          ))}
        </div>

        <div key={`${year}-${month}`} className={`grid grid-cols-7 gap-1.5 ${slideClass}`}>
          {Array.from({ length: blanks }).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const key         = dateKey(year, month, d);
            const isPast      = key < todayKey;
            const isClosed    = HOURS_BY_DOW[dayOfWeek(key)] === null;
            const isBlocked   = blocked.has(key);
            const isPending   = pending.has(key);
            const isConfirmed = confirmed.has(key);
            const isToday     = key === todayKey;
            const disabled    = isPast || isClosed;

            // Une seule couleur de fond / bordure / texte par état
            const look = disabled
              ? "bg-transparent border-transparent text-aria-dim"
              : isBlocked
                ? "bg-aria-danger/15 border-aria-danger text-aria-danger"
                : "bg-aria-elevated border-aria-border-strong text-aria-text";
            // En cours d'écriture : état visé, pâle et pointillé
            const pendingLook = isPending ? "opacity-55 border-dashed" : "";

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => toggle(key)}
                aria-pressed={isBlocked}
                aria-busy={isPending}
                aria-label={`${d} ${MONTHS_FR[month]}${isBlocked ? ", bloquée" : ""}${isClosed ? ", fermé" : ""}`}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center ${look} ${pendingLook} ${disabled ? "" : "active:scale-[0.96]"} ${isToday ? "ring-2 ring-aria-accent ring-offset-2 ring-offset-aria-surface" : ""}`}
                style={{ transition: CELL_TRANSITION }}
              >
                <span className="font-condensed font-medium text-[17px] leading-none tabular-nums">{d}</span>
                {isBlocked && !disabled && (
                  <span className="text-[9px] font-condensed font-semibold uppercase leading-none mt-1">Bloqué</span>
                )}
                {isConfirmed && (
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-7 h-7 rounded-full bg-aria-accent text-aria-bg flex items-center justify-center shadow-lg animate-check-flash">
                      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 text-[11px] text-aria-muted font-condensed uppercase tracking-[0.08em]">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] bg-aria-elevated border border-aria-border-strong" />Disponible</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] bg-aria-danger/15 border border-aria-danger" />Bloqué</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] border border-aria-dim/40" />Fermé</span>
      </div>

      {loadError ? (
        <button type="button" onClick={load} className="text-aria-danger text-sm text-center underline underline-offset-4">
          Impossible de charger les dates bloquées. Toucher pour réessayer.
        </button>
      ) : (
        <p className="text-center text-aria-muted text-xs">
          {blockedThisMonth === 0
            ? "Aucune date bloquée ce mois-ci."
            : `${blockedThisMonth} date${blockedThisMonth > 1 ? "s" : ""} bloquée${blockedThisMonth > 1 ? "s" : ""} ce mois-ci.`}
        </p>
      )}

      <div className="flex items-center justify-center gap-3 text-xs text-aria-muted">
        <span className="truncate">{session.user.email}</span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="font-condensed uppercase tracking-[0.12em] underline underline-offset-4 shrink-0"
        >
          Se déconnecter
        </button>
      </div>

      {toast && (
        <div role="status" className="fixed left-5 right-5 bottom-8 bg-aria-danger text-white text-sm text-center rounded-xl py-3 px-4 animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
