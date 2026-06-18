import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/service";

export async function GET() {
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("reservations")
    .select("id")
    .limit(1);

  if (error) {
    console.error("[keepalive] Supabase ping failed:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  console.log("[keepalive] Supabase ping ok:", new Date().toISOString());
  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
