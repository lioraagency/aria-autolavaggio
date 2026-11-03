'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Client Supabase pour le navigateur (clé anon, soumise au RLS).
 * Seul usage : /aria/dispo (connexion par lien magique + blocage de dates).
 * Flux "implicit" : le lien fonctionne même s'il s'ouvre dans un autre navigateur
 * que celui où il a été demandé (ex. navigateur intégré de l'appli courriel).
 */
export function getBrowserSupabase(): SupabaseClient {
  if (cached) return cached
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      auth: {
        flowType: 'implicit',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )
  return cached
}
