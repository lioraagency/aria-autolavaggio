-- Add operational timestamp columns + updated_at to reservations
-- These are written by PATCH /api/reservations/[id]/status

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS arrived_at   timestamptz,
  ADD COLUMN IF NOT EXISTS started_at   timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- Migrate alerts: add is_read boolean alongside existing read_at
-- (read_at IS NULL means unread; is_read is a convenience alias)
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- Back-fill is_read from read_at
UPDATE public.alerts SET is_read = (read_at IS NOT NULL);

-- Trigger to keep is_read in sync on update
CREATE OR REPLACE FUNCTION public.sync_alert_is_read()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_read := (NEW.read_at IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_alert_is_read ON public.alerts;
CREATE TRIGGER trg_sync_alert_is_read
  BEFORE INSERT OR UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.sync_alert_is_read();

-- Index for cockpit queries
CREATE INDEX IF NOT EXISTS reservations_scheduled_at_date_idx
  ON public.reservations (date(scheduled_at AT TIME ZONE 'America/Toronto'));
