import type { SessionOptions } from "iron-session";
import type { UserRole } from "./users";

export interface SessionData {
  userId:     string;
  userName:   string;
  role:       UserRole;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  cookieName: "aria_session",
  password:   process.env.AUTH_SECRET ?? "aria-fallback-secret-32chars-minimum!",
  cookieOptions: {
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
};
