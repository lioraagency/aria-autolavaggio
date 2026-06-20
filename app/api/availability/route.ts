import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, SupabaseConfigError } from "@/lib/supabase/service";

const MAX_PER_SLOT = 2;

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date invalide (YYYY-MM-DD requise)" }, { status: 400 });
  }

  const serviceParam = req.nextUrl.searchParams.get("service") ?? "complete";
  const SERVICE_DURATIONS: Record<string, number> = { exterior: 45, interior: 60, complete: 90 };
  const duration = SERVICE_DURATIONS[serviceParam] ?? 90;

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (e) {
    if (e instanceof SupabaseConfigError) {
      return NextResponse.json({ error: "config" }, { status: 500 });
    }
    throw e;
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const { data, error } = await supabase
    .from("reservations")
    .select("scheduled_at")
    .gte("scheduled_at", dayStart.toISOString())
    .lte("scheduled_at", dayEnd.toISOString())
    .neq("operational_status", "cancelled");

  if (error) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const d = new Date(row.scheduled_at as string);
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const roundedMin = "00";
    const key = `${String(hour).padStart(2, "0")}:${roundedMin}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const fullSlots = Object.keys(counts).filter((k) => counts[k] >= MAX_PER_SLOT);

  const now = new Date();
  const requestedDate = new Date(`${date}T00:00:00`);
  const isToday = now.toDateString() === requestedDate.toDateString();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  const HOURS_BY_DOW: Record<number, { open: number; close: number } | null> = {
    0: null, 1: { open: 9, close: 17 }, 2: { open: 9, close: 17 },
    3: { open: 9, close: 21 }, 4: { open: 9, close: 21 },
    5: { open: 9, close: 17 }, 6: null,
  };
  const requestedDow = requestedDate.getDay();
  const dayHours = HOURS_BY_DOW[requestedDow];

  const allSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    allSlots.push(`${String(h).padStart(2, "0")}:00`);
  }

  const availableSlots = allSlots.filter((slot) => {
    const slotHour = parseInt(slot.split(":")[0]);
    if (fullSlots.includes(slot)) return false;
    const [slotH, slotM] = slot.split(":").map(Number);
    const slotStartMinutes = slotH * 60 + slotM;
    const slotEndMinutes = slotStartMinutes + duration;
    if (dayHours) {
      const closeMinutes = dayHours.close * 60;
      if (slotEndMinutes > closeMinutes) return false;
    }
    if (isToday && (slotHour < currentHour || (slotHour === currentHour && currentMinutes > 0))) return false;
    return true;
  });

  return NextResponse.json({ date, counts, fullSlots, availableSlots, maxPerSlot: MAX_PER_SLOT });
}
