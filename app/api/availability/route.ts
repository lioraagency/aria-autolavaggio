import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, SupabaseConfigError } from "@/lib/supabase/service";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { BUSINESS_TZ } from "@/lib/time";
import { HOURS_BY_DOW } from "@/lib/hours";

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

  // Date bloquée par le propriétaire (/aria/dispo) : aucun créneau
  const { data: blockedRow, error: blockedErr } = await supabase
    .from("blocked_dates")
    .select("date")
    .eq("date", date)
    .maybeSingle();
  if (blockedErr) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  const isBlocked = blockedRow !== null;

  // Bornes de la journée à l'heure du commerce, converties en UTC réel
  const dayStart = fromZonedTime(`${date}T00:00:00`, BUSINESS_TZ);
  const dayEnd = fromZonedTime(`${date}T23:59:59`, BUSINESS_TZ);

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
    const hour = Number(formatInTimeZone(d, BUSINESS_TZ, "H"));
    const minutes = Number(formatInTimeZone(d, BUSINESS_TZ, "m"));
    const roundedMin = "00";
    const key = `${String(hour).padStart(2, "0")}:${roundedMin}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const fullSlots = Object.keys(counts).filter((k) => counts[k] >= MAX_PER_SLOT);

  const now = new Date();
  const requestedDate = new Date(`${date}T00:00:00`);
  const isToday = formatInTimeZone(now, BUSINESS_TZ, "yyyy-MM-dd") === date;
  const currentHour = Number(formatInTimeZone(now, BUSINESS_TZ, "H"));
  const currentMinutes = Number(formatInTimeZone(now, BUSINESS_TZ, "m"));

  const requestedDow = requestedDate.getDay();
  const dayHours = HOURS_BY_DOW[requestedDow];

  const allSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    allSlots.push(`${String(h).padStart(2, "0")}:00`);
  }

  const availableSlots = allSlots.filter((slot) => {
    const slotHour = parseInt(slot.split(":")[0]);
    if (!dayHours) return false;
    if (isBlocked) return false;
    if (fullSlots.includes(slot)) return false;
    const [slotH, slotM] = slot.split(":").map(Number);
    const slotStartMinutes = slotH * 60 + slotM;
    const slotEndMinutes = slotStartMinutes + duration;
    if (dayHours) {
      const openMinutes = dayHours.open * 60;
      if (slotStartMinutes < openMinutes) return false;
      const closeMinutes = dayHours.close * 60;
      if (slotEndMinutes > closeMinutes) return false;
    }
    if (isToday && (slotHour < currentHour || (slotHour === currentHour && currentMinutes > 0))) return false;
    return true;
  });

  return NextResponse.json({ date, blocked: isBlocked, counts, fullSlots, availableSlots, maxPerSlot: MAX_PER_SLOT });
}
