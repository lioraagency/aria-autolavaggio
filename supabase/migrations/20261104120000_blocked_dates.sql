-- Dates bloquées par le propriétaire (libre-service via /aria/dispo).
-- Une ligne = un jour du commerce (heure de Toronto) sans aucun créneau réservable.
--
-- Lecture : publique (ne révèle que des jours fermés).
-- Écriture : uniquement le compte Supabase Auth du propriétaire.
-- Pas de politique UPDATE : on bloque (INSERT) ou on débloque (DELETE), rien d'autre.

CREATE TABLE public.blocked_dates (
  date       date PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Droits explicites : sur ce projet, anon n'a aucun droit par défaut sur les tables
-- existantes, on ne compte donc pas sur les privilèges par défaut. Le RLS filtre ensuite.
GRANT SELECT         ON public.blocked_dates TO anon, authenticated;
GRANT INSERT, DELETE ON public.blocked_dates TO authenticated;
GRANT ALL            ON public.blocked_dates TO service_role;  -- routes API serveur

CREATE POLICY blocked_dates_select_public ON public.blocked_dates
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY blocked_dates_insert_owner ON public.blocked_dates
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'autolavaggio@gmail.com');

CREATE POLICY blocked_dates_delete_owner ON public.blocked_dates
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'autolavaggio@gmail.com');

NOTIFY pgrst, 'reload schema';
