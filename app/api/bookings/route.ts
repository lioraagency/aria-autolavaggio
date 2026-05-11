import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import { getBookingsForDate, getBookingsForWeek } from "@/lib/cal";
import type { SessionData } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authResponse = new NextResponse();
  const session = await getIronSession<SessionData>(req, authResponse, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date  = searchParams.get("date")  ?? new Date().toISOString().split("T")[0];
  const range = searchParams.get("range") ?? "day";

  const bookings = range === "week"
    ? await getBookingsForWeek(date)
    : await getBookingsForDate(date);

  return NextResponse.json({ bookings });
}
