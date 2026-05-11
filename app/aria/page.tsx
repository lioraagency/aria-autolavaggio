import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";
import { MOCK_BOOKINGS, getTodayRevenue, getNextBooking } from "@/lib/cal";
import AriaHeader from "@/components/AriaHeader";
import StatCard from "@/components/StatCard";
import TodayClient from "./TodayClient";

async function getSession(): Promise<SessionData | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getIronSession<SessionData>(cookies() as any, sessionOptions);
    return session.isLoggedIn ? session : null;
  } catch { return null; }
}

export default async function TodayPage() {
  const session  = await getSession();
  const userName = session?.userName ?? "vous";
  const today    = new Date().toISOString().split("T")[0];
  const bookings = MOCK_BOOKINGS.filter((b) => b.date === today);
  const revenue  = getTodayRevenue(bookings);
  const next     = getNextBooking(bookings);
  const confirmedCount = bookings.filter((b) => b.status !== "cancelled").length;

  return (
    <div className="min-h-full animate-fade-in">
      <AriaHeader userName={userName} alertCount={1} />

      <div className="px-4 pt-2 pb-4 space-y-4">

        <div>
          <p className="font-condensed font-black text-3xl uppercase text-aria-text tracking-tight leading-tight">
            {new Date().toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-2">
          <StatCard label="RDV"      value={String(confirmedCount)} sub="aujourd'hui" accent />
          <StatCard label="Revenus"  value={`${revenue} $`}         sub="estimés" />
          <StatCard label="Prochain" value={next?.startTime ?? "—"} sub={next ? next.clientName : "Aucun"} />
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-condensed font-black text-lg uppercase tracking-wider text-aria-text">
              RDV du jour
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-aria-surface border border-aria-border rounded-xl p-8 text-center">
              <p className="text-aria-muted font-condensed uppercase tracking-wider text-sm">Journée libre</p>
            </div>
          ) : (
            <TodayClient initialBookings={bookings} />
          )}
        </div>

      </div>

      {/* FAB */}
      <a
        href="https://appt.link/autolavaggio-8H7M5KaR"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-aria-accent flex items-center justify-center shadow-lg shadow-aria-accent/20 active:scale-95 transition-transform z-40"
        aria-label="Bloquer un créneau"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06100A" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </a>
    </div>
  );
}
