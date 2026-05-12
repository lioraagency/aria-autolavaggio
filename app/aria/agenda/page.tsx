"use client";
import { useState, useMemo } from "react";
import AriaHeader from "@/components/AriaHeader";
import BookingCard from "@/components/BookingCard";
import CustomerDetailPanel from "@/components/CustomerDetailPanel";
import { BOOKINGS, getCustomer, getVehicle } from "@/lib/mock-data";
import type { Booking, OperationalStatus } from "@/lib/types";
import { centsToDisplay, getNextStatus } from "@/lib/types";

type ViewMode  = "semaine" | "mois";
type FilterTab = "tous" | "en_cours" | "prets" | "termines" | "annules";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "tous",      label: "Tous" },
  { key: "en_cours",  label: "En cours" },
  { key: "prets",     label: "Prêts" },
  { key: "termines",  label: "Terminés" },
  { key: "annules",   label: "Annulés" },
];

function matchesFilter(b: Booking, f: FilterTab): boolean {
  switch (f) {
    case "tous":      return true;
    case "en_cours":  return ["arrived","in_progress","drying","quality_check"].includes(b.operationalStatus);
    case "prets":     return b.operationalStatus === "ready";
    case "termines":  return ["picked_up"].includes(b.operationalStatus);
    case "annules":   return ["cancelled","no_show"].includes(b.operationalStatus);
  }
}

function groupByDate(bookings: Booking[]): [string, Booking[]][] {
  const map = new Map<string, Booking[]>();
  bookings.forEach(b => {
    const key = b.scheduledAt.toISOString().split("T")[0];
    const arr = map.get(key) ?? [];
    arr.push(b);
    map.set(key, arr);
  });
  return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b));
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const yesterday= new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today)     return "Aujourd'hui";
  if (dateStr === tomorrow)  return "Demain";
  if (dateStr === yesterday) return "Hier";
  return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
}

// Mini calendar dot component for month view
function MonthView({ bookings }: { bookings: Booking[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const countByDay = bookings.reduce<Record<number, number>>((acc, b) => {
    if (b.scheduledAt.getFullYear() === year && b.scheduledAt.getMonth() === month) {
      const d = b.scheduledAt.getDate();
      acc[d] = (acc[d] ?? 0) + 1;
    }
    return acc;
  }, {});

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 });

  return (
    <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 mb-4">
      <p className="text-xs font-condensed uppercase tracking-widest text-aria-muted mb-3 text-center">
        {now.toLocaleDateString("fr-CA", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["L","M","M","J","V","S","D"].map((d,i) => (
          <p key={i} className="text-[10px] text-aria-muted font-condensed uppercase mb-1">{d}</p>
        ))}
        {blanks.map((_,i) => <div key={`b${i}`} />)}
        {days.map(d => {
          const count = countByDay[d] ?? 0;
          const isToday = d === now.getDate();
          return (
            <div key={d} className="flex flex-col items-center gap-0.5 py-1">
              <span className={`text-xs font-condensed w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? "bg-aria-accent text-aria-bg font-black" : "text-aria-text"}`}>
                {d}
              </span>
              {count > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_,i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-aria-accent" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const [view,     setView]     = useState<ViewMode>("semaine");
  const [filter,   setFilter]   = useState<FilterTab>("tous");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);

  const filtered = useMemo(() =>
    bookings.filter(b => matchesFilter(b, filter)),
    [bookings, filter]
  );

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleStatusAdvance = (bookingId: string, newStatus: OperationalStatus) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, operationalStatus: newStatus } : b
    ));
    setSelected(prev => prev?.id === bookingId ? { ...prev, operationalStatus: newStatus } : prev);
  };

  const handleSmsSend = async (bookingId: string) => {
    const booking  = bookings.find(b => b.id === bookingId);
    const customer = booking ? getCustomer(booking.customerId) : undefined;
    if (!customer || !booking) return;
    try {
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, phone: customer.phone, firstName: customer.firstName }),
      });
    } catch { /* ignore */ }
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, smsReadySentAt: new Date() } : b
    ));
  };

  const handleCancel = (bookingId: string) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, operationalStatus: "cancelled" as OperationalStatus } : b
    ));
    setSelected(null);
  };

  const selectedCustomer = selected ? getCustomer(selected.customerId) : undefined;
  const selectedVehicle  = selected ? getVehicle(selected.vehicleId)   : undefined;

  return (
    <div className="animate-fade-in">
      <AriaHeader alertCount={1} />

      <div className="px-4 pt-2 pb-4 space-y-3">
        {/* Title + toggle */}
        <div className="flex items-center justify-between">
          <h1 className="font-condensed font-black text-2xl uppercase tracking-tight text-aria-text">
            Agenda
          </h1>
          <div className="flex bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden">
            {(["semaine", "mois"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-condensed uppercase tracking-wider transition-colors duration-150 min-h-[36px] ${
                  view === v ? "bg-aria-accent text-aria-bg font-black" : "text-aria-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Month view calendar */}
        {view === "mois" && <MonthView bookings={bookings} />}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-condensed uppercase tracking-wider min-h-[32px] transition-all duration-150 ${
                filter === key
                  ? "bg-aria-accent text-aria-bg font-black"
                  : "bg-aria-surface border border-[rgba(255,255,255,0.06)] text-aria-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {grouped.length === 0 ? (
          <div className="bg-aria-surface border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 text-center">
            <p className="text-aria-muted font-condensed uppercase tracking-wider text-sm">Aucun rendez-vous</p>
          </div>
        ) : (
          grouped.map(([date, dayBookings]) => {
            const dayRevenue = dayBookings
              .filter(b => !["cancelled","no_show"].includes(b.operationalStatus))
              .reduce((s,b) => s + b.price, 0);
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 sticky top-0 bg-aria-bg py-1 z-10">
                  <h2 className="font-condensed font-black text-xs uppercase tracking-widest text-aria-accent capitalize">
                    {formatDayHeader(date)}
                  </h2>
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" aria-hidden="true" />
                  <span className="text-aria-muted text-xs font-condensed">
                    {dayBookings.length} RDV · {centsToDisplay(dayRevenue)}
                  </span>
                </div>
                {dayBookings.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onTap={setSelected}
                    onStatusAdvance={handleStatusAdvance}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Customer Detail Panel */}
      {selected && selectedCustomer && selectedVehicle && (
        <CustomerDetailPanel
          booking={selected}
          customer={selectedCustomer}
          vehicle={selectedVehicle}
          isOpen={true}
          onClose={() => setSelected(null)}
          onStatusAdvance={handleStatusAdvance}
          onSmsSend={handleSmsSend}
        />
      )}
    </div>
  );
}
