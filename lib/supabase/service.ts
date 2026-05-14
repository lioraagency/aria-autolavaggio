import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service role key.
 * Never import this module from client components or shared code that ships to the browser.
 */
export function getServiceSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceRole) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    throw new SupabaseConfigError(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and set all Supabase keys (Vercel → Project → Settings → Environment Variables in production)."
    );
  }

  cached = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}
