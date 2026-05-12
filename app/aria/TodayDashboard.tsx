"use client";
import { useState, useCallback } from "react";
import type { Booking, OperationalStatus, Customer } from "@/lib/types";
import { getNextStatus, centsToDisplay } from "@/lib/types";
import { getCustomer, getVehicle } from "@/lib/mock-data";
import StatCard from "@/components/StatCard";
import BookingCard from "@/components/BookingCard";
import CustomerDetailPanel from "@/components/CustomerDetailPanel";

interface TodayStats {
  active:    Booking[];
  ready:     Booking[];
  revenue:   number;
  estimated: number;
  scheduled: Booking[];
  next?:     Booking;
}

interface Props {
  initialBookings: Booking[];
  stats: TodayStats;
  enriched: Array<{ booking: Booking; customer: Customer | undefined }>;
}

export default function TodayDashboard({ initialBookings, stats: initialStats }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selected, setSelected]   = useState<Booking | null>(null);
  const [toast,    setToast]       = useState<string>("");
  const [toastOut, setToastOut]    = useState(false);

  // Derived stats from live state
  const active    = bookings.filter(b => ['in_progress','drying','quality_check'].includes(b.operationalStatus));
  const ready     = bookings.filter(b => b.operationalStatus === 'ready');
  const revenue   = bookings.filter(b => ['paid','pending'].includes(b.paymentStatus) && !['cancelled','no_show'].includes(b.operationalStatus)).reduce((s,b) => s + b.price, 0);
  const estimated = bookings.filter(b => !['cancelled','no_show'].includes(b.operationalStatus)).reduce((s,b) => s + b.price, 0);
  const scheduled = bookings.filter(b => b.operationalStatus === 'scheduled');
  const nextRdv   = [...scheduled].sort((a,b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];

  const showToast = useCallback((msg: string) => {
    setToastOut(false);
    setToast(msg);
    setTimeout(() => setToastOut(true), 2000);
    setTimeout(() => setToast(""), 2600);
  }, []);

  const handleStatusAdvance = useCallback((bookingId: string, newStatus: OperationalStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId
      ? { ...b, operationalStatus: newStatus,
          arrivedAt:    newStatus === 'arrived'     ? new Date() : b.arrivedAt,
          startedAt:    newStatus === 'in_progress' ? new Date() : b.startedAt,
          completedAt:  newStatus === 'ready'       ? new Date() : b.completedAt,
          pickedUpAt:   newStatus === 'picked_up'   ? new Date() : b.pickedUpAt,
          paymentStatus: newStatus === 'picked_up' ? 'paid' : b.paymentStatus,
        }
      : b
    ));
    setSelected(prev => prev?.id === bookingId
      ? { ...prev, operationalStatus: newStatus }
      : prev
    );
  }, []);

  const handleSmsSend = useCallback(async (bookingId: string) => {
    const booking  = bookings.find(b => b.id === bookingId);
    const customer = booking ? getCustomer(booking.customerId) : undefined;
    if (!customer || !booking) return;

    try {
      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, phone: customer.phone, firstName: customer.firstName }),
      });
    } catch { /* mock — ignore errors */ }

    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, smsReadySentAt: new Date() } : b
    ));
    setSelected(prev => prev?.id === bookingId
      ? { ...prev, smsReadySentAt: new Date() } : prev
    );
    const phoneDisplay = customer.phone.replace(/(\d{3})-(\d{3})-(\d{4})/, '+1 $1 ***-$3');
    showToast(`SMS envoyé à ${customer.firstName} ${customer.lastName} (${phoneDisplay})`);
  }, [bookings, showToast]);

  const handleCancel = useCallback((bookingId: string) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, operationalStatus: 'cancelled' as OperationalStatus } : b
    ));
    setSelected(null);
  }, []);

  const selectedCustomer = selected ? getCustomer(selected.customerId) : undefined;
  const selectedVehicle  = selected ? getVehicle(selected.vehicleId)   : undefined;

  const nextTime = nextRdv
    ? nextRdv.scheduledAt.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 left-4 right-4 z-50 bg-aria-success text-aria-bg px-4 py-3 rounded-xl font-condensed text-sm font-bold text-center ${toastOut ? 'animate-toast-out' : 'animate-toast-in'}`}>
          {toast}
        </div>
      )}

      <div className="px-4 pt-2 pb-4 space-y-4">
        {/* Date */}
        <div>
          <p className="font-condensed font-black text-[26px] uppercase text-aria-text tracking-tight leading-tight">
            {new Date().toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* 4 StatCards 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="En cours"
            value={String(active.length)}
            sub={active.length > 0 ? `${active.length} actif${active.length > 1 ? 's' : ''}` : 'Aucun'}
            accent
            pulse={active.length > 0}
          />
          <StatCard
            label="Prêts"
            value={String(ready.length)}
            sub={ready.length > 0 ? 'À récupérer' : 'Aucun'}
            glow={ready.length > 0}
          />
          <StatCard
            label="Revenus"
            value={centsToDisplay(revenue)}
            sub={`/ ${centsToDisplay(estimated)} estimé`}
          />
          <StatCard
            label="À venir"
            value={String(scheduled.length)}
            sub={nextTime ? `Prochain: ${nextTime}` : 'Aucun'}
          />
        </div>

        {/* Booking list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-condensed font-black text-base uppercase tracking-widest text-aria-text">
              Aujourd&apos;hui · {bookings.length} RDV
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-aria-surface border border-aria-border rounded-2xl p-8 text-center">
              <p className="text-aria-muted font-condensed uppercase tracking-wider text-sm">Journée libre</p>
            </div>
          ) : (
            <div>
              {bookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onTap={setSelected}
                  onStatusAdvance={handleStatusAdvance}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <a
        href="https://appt.link/autolavaggio-8H7M5KaR"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-aria-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform z-40"
        style={{ boxShadow: '0 4px 20px rgba(212,255,63,0.3)' }}
        aria-label="Nouveau RDV"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </a>

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
    </>
  );
}
