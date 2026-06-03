import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, SupabaseConfigError } from "@/lib/supabase/service";

const MAX_PER_SLOT = 2;

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date invalide (YYYY-MM-DD requise)" }, { status: 400 });
  }

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
    const key = `${String(hour).padStart(2, "0")}:00`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const fullSlots = Object.keys(counts).filter((k) => counts[k] >= MAX_PER_SLOT);

  return NextResponse.json({ date, counts, fullSlots, maxPerSlot: MAX_PER_SLOT });
}
