-- Sprint 1: core tables for public reservations (ARIA Autolavaggio)
-- Apply in Supabase SQL editor or via Supabase CLI if linked.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  phone_normalized text NOT NULL,
  email text,
  total_visits integer NOT NULL DEFAULT 0,
  total_spent_cents integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customers_phone_normalized_key UNIQUE (phone_normalized)
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  service_type text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  estimated_duration_minutes integer NOT NULL,
  operational_status text NOT NULL DEFAULT 'scheduled',
  payment_status text NOT NULL DEFAULT 'unpaid',
  price_cents integer NOT NULL,
  notes text,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_year integer NOT NULL,
  vehicle_color text NOT NULL,
  vehicle_type text NOT NULL,
  vehicle_notes text,
  supplements jsonb NOT NULL DEFAULT '[]'::jsonb,
  sms_opt_in boolean NOT NULL DEFAULT false,
  is_first_visit boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reservations_customer_id_idx ON public.reservations (customer_id);
CREATE INDEX IF NOT EXISTS reservations_scheduled_at_idx ON public.reservations (scheduled_at);

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations (id) ON DELETE CASCADE,
  alert_type text NOT NULL DEFAULT 'new_reservation',
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alerts_reservation_id_idx ON public.alerts (reservation_id);
CREATE INDEX IF NOT EXISTS alerts_read_at_idx ON public.alerts (read_at);

CREATE TABLE IF NOT EXISTS public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'info',
  event_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  reservation_id uuid REFERENCES public.reservations (id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs (created_at DESC);
