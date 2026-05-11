"use client";
import { useState } from "react";
import AriaHeader from "@/components/AriaHeader";
import BookingCard from "@/components/BookingCard";
import { MOCK_BOOKINGS } from "@/lib/cal";
import type { Booking } from "@/lib/cal";

type ViewMode = "semaine" | "mois";

function groupByDate(bookings: Booking[]): Record<string, Booking[]> {
  return bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    (acc[b.date] = acc[b.date] ?? []).push(b);
    return acc;
  }, {});
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today)    return "Aujourd'hui";
  if (dateStr === tomorrow) return "Demain";
  return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
}

export default function AgendaPage() {
  const [view, setView] = useState<ViewMode>("semaine");
  const bookings  = MOCK_BOOKINGS;
  const grouped   = groupByDate(bookings);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="animate-fade-in">
      <AriaHeader alertCount={1} />

      <div className="px-4 pt-2 pb-4 space-y-4">

        {/* Title + toggle */}
        <div className="flex items-center justify-between">
          <h1 className="font-condensed font-black text-2xl uppercase tracking-tight text-aria-text">
            Agenda
          </h1>
          <div className="flex bg-aria-surface border border-aria-border rounded-lg overflow-hidden">
            {(["semaine", "mois"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-condensed uppercase tracking-wider transition-colors duration-150 ${
                  view === v
                    ? "bg-aria-accent text-aria-bg font-black"
                    : "text-aria-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings grouped by day */}
        {sortedDates.length === 0 ? (
          <div className="bg-aria-surface border border-aria-border rounded-xl p-8 text-center">
            <p className="text-aria-muted font-condensed uppercase tracking-wider text-sm">
              Aucun rendez-vous
            </p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-condensed font-black text-sm uppercase tracking-widest text-aria-accent capitalize">
                  {formatDateHeader(date)}
                </h2>
                <div className="flex-1 h-px bg-aria-border" aria-hidden="true" />
                <span className="text-aria-muted text-xs font-condensed">
                  {grouped[date].length} RDV
                </span>
              </div>
              {grouped[date].map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ))
        )}

      </div>
    </div>
  );
}
