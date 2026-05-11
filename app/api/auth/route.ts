import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import { getUserByPin } from "@/lib/users";
import type { SessionData } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json() as { pin?: string };
  const { pin } = body;

  if (!pin || pin.length !== 4) {
    return NextResponse.json({ error: "PIN invalide" }, { status: 400 });
  }

  const user = getUserByPin(pin);
  if (!user) {
    return NextResponse.json({ error: "PIN incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, name: user.name, role: user.role });
  // iron-session v8: pass req + res (NextResponse) for Route Handlers
  const session = await getIronSession<SessionData>(req, response, sessionOptions);
  session.userId     = user.id;
  session.userName   = user.name;
  session.role       = user.role;
  session.isLoggedIn = true;
  await session.save();

  return response;
}
