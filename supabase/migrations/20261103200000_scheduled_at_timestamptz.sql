-- Migre reservations.scheduled_at de `timestamp without time zone` vers `timestamptz`.
--
-- Contexte : en prod la colonne était un timestamp naïf (le schéma divergeait de
-- 20260513120000_sprint1_core_tables.sql), rempli avec l'heure locale de Toronto.
-- Le fix DST déployé le 2026-11-03 à 18:15:39 UTC écrit désormais l'heure UTC.
-- Trois cas coexistent donc dans la colonne :
--   - lignes créées après le déploiement            -> UTC naïf
--   - 13 réservations à venir recalées manuellement -> UTC naïf
--   - 271 lignes historiques                         -> heure de Toronto naïve
--
-- Écrivains existants : une chaîne sans fuseau insérée dans un timestamptz est interprétée
-- dans le fuseau de session (UTC sur Supabase), donc même résultat qu'aujourd'hui.
-- Lecteurs : Supabase renverra "...+00:00" au lieu d'une chaîne sans fuseau.

BEGIN;

-- Aucune écriture concurrente pendant la migration
LOCK TABLE public.reservations IN ACCESS EXCLUSIVE MODE;

-- 0) Gardes : bon type, et répartition attendue (13 recalées, 271 historiques)
DO $$
DECLARE n_recalees int; n_toronto int;
BEGIN
  IF (SELECT data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'reservations'
         AND column_name = 'scheduled_at') <> 'timestamp without time zone' THEN
    RAISE EXCEPTION 'scheduled_at n''est pas en timestamp without time zone — migration déjà appliquée ?';
  END IF;

  SELECT count(*) FILTER (WHERE id IN (
           '8ce8d1dd-e35f-43fd-92b6-a2084bcae26b','76aa5e77-2988-4378-a863-67a5790f80ef',
           'cb97a470-fd75-4629-b173-2fdd61bd6474','0fd23d0d-cb5d-46f9-b47c-9e9a71984b49',
           '86ff9aa0-3776-4070-b685-3da51e5c17a0','bf875e3b-180a-4fe6-a03e-d9c1520ba762',
           '014cd5e4-a0df-465a-a304-1d352d4f0532','40822cef-288d-4ceb-b5e5-c4e47f52eddc',
           'bb2a2db1-7372-4213-be52-5e7e5caef429','e79647a4-9677-420b-9b58-4246553e3b4d',
           '57a82a74-d848-41a0-87da-569d0d648248','9dc96ffa-4759-4804-939f-9eb1ae2a685a',
           '7a5456f0-2b5c-4956-8224-9e365f13c38a')
           AND created_at < '2026-11-03 18:15:39+00'),
         count(*) FILTER (WHERE created_at < '2026-11-03 18:15:39+00' AND id NOT IN (
           '8ce8d1dd-e35f-43fd-92b6-a2084bcae26b','76aa5e77-2988-4378-a863-67a5790f80ef',
           'cb97a470-fd75-4629-b173-2fdd61bd6474','0fd23d0d-cb5d-46f9-b47c-9e9a71984b49',
           '86ff9aa0-3776-4070-b685-3da51e5c17a0','bf875e3b-180a-4fe6-a03e-d9c1520ba762',
           '014cd5e4-a0df-465a-a304-1d352d4f0532','40822cef-288d-4ceb-b5e5-c4e47f52eddc',
           'bb2a2db1-7372-4213-be52-5e7e5caef429','e79647a4-9677-420b-9b58-4246553e3b4d',
           '57a82a74-d848-41a0-87da-569d0d648248','9dc96ffa-4759-4804-939f-9eb1ae2a685a',
           '7a5456f0-2b5c-4956-8224-9e365f13c38a'))
    INTO n_recalees, n_toronto
    FROM public.reservations;

  IF n_recalees <> 13 OR n_toronto <> 271 THEN
    RAISE EXCEPTION 'Répartition inattendue : % recalées (13 attendues), % historiques (271 attendues) — rien n''est modifié',
      n_recalees, n_toronto;
  END IF;
END $$;

-- 1) Sauvegarde des valeurs actuelles + fuseau d'origine de chaque ligne
--    (à supprimer une fois la migration validée)
CREATE TABLE public.reservations_backup_scheduled_at_20261103 AS
SELECT id,
       created_at,
       scheduled_at,
       CASE
         WHEN created_at >= '2026-11-03 18:15:39+00' THEN 'UTC'
         WHEN id IN (
           '8ce8d1dd-e35f-43fd-92b6-a2084bcae26b','76aa5e77-2988-4378-a863-67a5790f80ef',
           'cb97a470-fd75-4629-b173-2fdd61bd6474','0fd23d0d-cb5d-46f9-b47c-9e9a71984b49',
           '86ff9aa0-3776-4070-b685-3da51e5c17a0','bf875e3b-180a-4fe6-a03e-d9c1520ba762',
           '014cd5e4-a0df-465a-a304-1d352d4f0532','40822cef-288d-4ceb-b5e5-c4e47f52eddc',
           'bb2a2db1-7372-4213-be52-5e7e5caef429','e79647a4-9677-420b-9b58-4246553e3b4d',
           '57a82a74-d848-41a0-87da-569d0d648248','9dc96ffa-4759-4804-939f-9eb1ae2a685a',
           '7a5456f0-2b5c-4956-8224-9e365f13c38a') THEN 'UTC'
         ELSE 'America/Toronto'
       END AS fuseau_origine
FROM public.reservations;

-- 2) Conversion : chaque valeur naïve est interprétée dans son fuseau d'origine
ALTER TABLE public.reservations
  ALTER COLUMN scheduled_at TYPE timestamptz
  USING CASE
    WHEN created_at >= '2026-11-03 18:15:39+00' THEN scheduled_at AT TIME ZONE 'UTC'
    WHEN id IN (
      '8ce8d1dd-e35f-43fd-92b6-a2084bcae26b','76aa5e77-2988-4378-a863-67a5790f80ef',
      'cb97a470-fd75-4629-b173-2fdd61bd6474','0fd23d0d-cb5d-46f9-b47c-9e9a71984b49',
      '86ff9aa0-3776-4070-b685-3da51e5c17a0','bf875e3b-180a-4fe6-a03e-d9c1520ba762',
      '014cd5e4-a0df-465a-a304-1d352d4f0532','40822cef-288d-4ceb-b5e5-c4e47f52eddc',
      'bb2a2db1-7372-4213-be52-5e7e5caef429','e79647a4-9677-420b-9b58-4246553e3b4d',
      '57a82a74-d848-41a0-87da-569d0d648248','9dc96ffa-4759-4804-939f-9eb1ae2a685a',
      '7a5456f0-2b5c-4956-8224-9e365f13c38a') THEN scheduled_at AT TIME ZONE 'UTC'
    ELSE scheduled_at AT TIME ZONE 'America/Toronto'
  END;

-- 3) Vérification aller-retour : la nouvelle valeur, relue dans le fuseau d'origine de
--    la ligne, doit redonner exactement l'ancienne valeur naïve
DO $$
DECLARE n_total int; n_backup int; n_ok int; n_utc int; n_toronto int;
BEGIN
  SELECT count(*) INTO n_total FROM public.reservations;
  SELECT count(*),
         count(*) FILTER (WHERE fuseau_origine = 'UTC'),
         count(*) FILTER (WHERE fuseau_origine = 'America/Toronto')
    INTO n_backup, n_utc, n_toronto
    FROM public.reservations_backup_scheduled_at_20261103;
  SELECT count(*) INTO n_ok
    FROM public.reservations r
    JOIN public.reservations_backup_scheduled_at_20261103 b ON b.id = r.id
   WHERE r.scheduled_at AT TIME ZONE b.fuseau_origine = b.scheduled_at;

  IF n_total <> n_backup OR n_ok <> n_total OR n_toronto <> 271 OR n_utc <> n_total - 271 THEN
    RAISE EXCEPTION 'Vérification échouée : total %, sauvegarde %, aller-retour OK %, UTC %, Toronto % — tout est annulé',
      n_total, n_backup, n_ok, n_utc, n_toronto;
  END IF;
END $$;

COMMIT;

-- 4) Recharger le schéma de l'API Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';

-- Vérification après coup (lecture seule) — l'heure Toronto doit correspondre au Google Calendar :
-- SELECT r.id, b.fuseau_origine,
--        to_char(b.scheduled_at, 'YYYY-MM-DD HH24:MI') || ' (avant, brut)'                        AS avant,
--        to_char(r.scheduled_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC'                 AS apres_utc,
--        to_char(r.scheduled_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI') || ' Toronto' AS apres_toronto
-- FROM public.reservations r
-- JOIN public.reservations_backup_scheduled_at_20261103 b ON b.id = r.id
-- ORDER BY r.scheduled_at;
--
-- Retour arrière (si besoin) : restaure les valeurs naïves exactes d'avant la migration
-- BEGIN;
-- ALTER TABLE public.reservations ALTER COLUMN scheduled_at TYPE timestamp
--   USING scheduled_at AT TIME ZONE 'UTC';
-- UPDATE public.reservations r SET scheduled_at = b.scheduled_at
--   FROM public.reservations_backup_scheduled_at_20261103 b WHERE r.id = b.id;
-- COMMIT;
-- NOTIFY pgrst, 'reload schema';
