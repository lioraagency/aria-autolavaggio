"use client";
import { useState, useCallback } from "react";
import BookingCard from "@/components/BookingCard";
import type { Booking } from "@/lib/cal";

interface TodayClientProps {
  initialBookings: Booking[];
}

export default function TodayClient({ initialBookings }: TodayClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh simulation (touch events handled by native behaviour + manual trigger)
  const refresh = useCallback(async () => {
    setRefreshing(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/bookings?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch { /* keep existing */ }
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleConfirm = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: "confirmed" as const } : b)
    );
  }, []);

  const handleCancel = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const } : b)
    );
  }, []);

  return (
    <div>
      {/* Refresh indicator */}
      {refreshing && (
        <div className="flex justify-center py-2 mb-2">
          <div className="flex gap-1.5">
            {[0,1,2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-aria-accent animate-bounce"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Manual refresh button */}
      <button
        onClick={refresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 text-aria-muted text-xs font-condensed uppercase tracking-wider mb-3 active:text-aria-dim transition-colors"
        aria-label="Actualiser"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={refreshing ? "animate-spin" : ""}>
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Actualiser
      </button>

      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ))}

      <p className="text-center text-aria-muted text-xs font-condensed uppercase tracking-wider mt-4 pb-2">
        ← Glisser gauche = annuler · droite = confirmer →
      </p>
    </div>
  );
}
