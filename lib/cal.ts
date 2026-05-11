/**
 * Cal.com API wrapper
 * For v0.1, uses mock data. Replace with live API when CAL_API_KEY is set.
 */

export interface Booking {
  id:        string;
  startTime: string;   // "HH:MM"
  endTime:   string;   // "HH:MM"
  clientName: string;
  service:   string;
  duration:  number;   // minutes
  price:     number;   // CAD dollars
  status:    "confirmed" | "pending" | "cancelled";
  phone?:    string;
  note?:     string;
  date:      string;   // YYYY-MM-DD
}

// ── Mock data (replace with live API calls) ─────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk_001",
    date: today,
    startTime: "10:00",
    endTime:   "11:30",
    clientName: "Martin L.",
    service:   "Service Complet",
    duration:  90,
    price:     99,
    status:    "confirmed",
    phone:     "418-555-0101",
    note:      "",
  },
  {
    id: "bk_002",
    date: today,
    startTime: "13:30",
    endTime:   "14:15",
    clientName: "Sarah B.",
    service:   "Extérieur seul",
    duration:  45,
    price:     65,
    status:    "confirmed",
    phone:     "418-555-0202",
  },
  {
    id: "bk_003",
    date: today,
    startTime: "16:00",
    endTime:   "17:00",
    clientName: "François T.",
    service:   "Intérieur seul",
    duration:  60,
    price:     70,
    status:    "confirmed",
    phone:     "418-555-0303",
    note:      "Siège bébé à démonter",
  },
  {
    id: "bk_004",
    date: tomorrow,
    startTime: "09:00",
    endTime:   "10:30",
    clientName: "Julie M.",
    service:   "Service Complet",
    duration:  90,
    price:     99,
    status:    "pending",
    phone:     "418-555-0404",
  },
  {
    id: "bk_005",
    date: tomorrow,
    startTime: "11:00",
    endTime:   "11:45",
    clientName: "Pierre D.",
    service:   "Extérieur seul",
    duration:  45,
    price:     65,
    status:    "confirmed",
  },
];

// ── API functions ────────────────────────────────────────────────────────────

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  const apiKey = process.env.CAL_API_KEY;

  // Use live API if key is set (not a placeholder)
  if (apiKey && !apiKey.includes("placeholder")) {
    try {
      const res = await fetch(
        `https://api.cal.com/v1/bookings?apiKey=${apiKey}&dateFrom=${date}&dateTo=${date}`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const data = await res.json();
        // Transform cal.com response to our Booking format
        return (data.bookings ?? []).map((b: Record<string, unknown>) => ({
          id:         b.uid as string,
          date,
          startTime:  new Date(b.startTime as string).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", hour12: false }),
          endTime:    new Date(b.endTime as string).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", hour12: false }),
          clientName: (b.attendees as Array<{name: string}>)?.[0]?.name ?? "Client",
          service:    (b.title as string) ?? "Service",
          duration:   Math.round((new Date(b.endTime as string).getTime() - new Date(b.startTime as string).getTime()) / 60000),
          price:      0,
          status:     (b.status as Booking["status"]) ?? "confirmed",
        }));
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Return mock data filtered by date
  return MOCK_BOOKINGS.filter((b) => b.date === date);
}

export async function getBookingsForWeek(startDate: string): Promise<Booking[]> {
  const apiKey = process.env.CAL_API_KEY;
  const endDate = new Date(new Date(startDate).getTime() + 7 * 86400000)
    .toISOString().split("T")[0];

  if (apiKey && !apiKey.includes("placeholder")) {
    try {
      const res = await fetch(
        `https://api.cal.com/v1/bookings?apiKey=${apiKey}&dateFrom=${startDate}&dateTo=${endDate}`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const data = await res.json();
        return data.bookings ?? [];
      }
    } catch { /* fall through */ }
  }

  // Return all mock bookings in range
  const start = new Date(startDate).getTime();
  const end   = start + 7 * 86400000;
  return MOCK_BOOKINGS.filter((b) => {
    const t = new Date(b.date).getTime();
    return t >= start && t < end;
  });
}

export function getTodayRevenue(bookings: Booking[]): number {
  return bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price, 0);
}

export function getNextBooking(bookings: Booking[]): Booking | null {
  const now = new Date();
  const nowStr = now.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    bookings
      .filter((b) => b.status !== "cancelled" && b.startTime > nowStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0] ?? null
  );
}
