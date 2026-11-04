-- Corrige l'adresse du propriétaire autorisée à écrire dans blocked_dates.
-- Ancienne adresse (autolavaggio@gmail.com) : n'appartient pas au propriétaire, retirée.
-- Nouvelle adresse : autolavaggioquebec@gmail.com (minuscules : Supabase Auth stocke
-- les courriels en minuscules et la comparaison ci-dessous est exacte).
-- Seules les deux politiques d'écriture changent ; lecture et droits inchangés.

BEGIN;

DROP POLICY IF EXISTS blocked_dates_insert_owner ON public.blocked_dates;
DROP POLICY IF EXISTS blocked_dates_delete_owner ON public.blocked_dates;

CREATE POLICY blocked_dates_insert_owner ON public.blocked_dates
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'autolavaggioquebec@gmail.com');

CREATE POLICY blocked_dates_delete_owner ON public.blocked_dates
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'autolavaggioquebec@gmail.com');

COMMIT;

NOTIFY pgrst, 'reload schema';
