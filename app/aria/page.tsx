import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";
import { getCockpitData, computeTodayStats } from "@/lib/supabase/data";
import AriaHeader from "@/components/AriaHeader";
import TodayDashboard from "./TodayDashboard";

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

  const { bookings, customerMap, vehicleMap } = await getCockpitData('today');
  const stats = computeTodayStats(bookings);

  const enriched = bookings.map(b => ({
    booking:  b,
    customer: customerMap[b.customerId],
  }));

  return (
    <div className="min-h-full animate-fade-in">
      <AriaHeader userName={userName} alertCount={stats.active.length + stats.ready.length} />
      <TodayDashboard
        initialBookings={bookings}
        stats={stats}
        enriched={enriched}
        customerMap={customerMap}
        vehicleMap={vehicleMap}
      />
    </div>
  );
}
