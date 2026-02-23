CREATE TABLE IF NOT EXISTS public.water_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  ph DOUBLE PRECISION NOT NULL,
  turbidity DOUBLE PRECISION NOT NULL,
  tds DOUBLE PRECISION NOT NULL,
  temperature DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_water_readings_device ON public.water_readings (device_id);
CREATE INDEX IF NOT EXISTS idx_water_readings_created ON public.water_readings (created_at DESC);

CREATE TABLE IF NOT EXISTS public.water_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  message TEXT NOT NULL,
  ph DOUBLE PRECISION,
  turbidity DOUBLE PRECISION,
  tds DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_water_alerts_device ON public.water_alerts (device_id);
CREATE INDEX IF NOT EXISTS idx_water_alerts_created ON public.water_alerts (created_at DESC);

ALTER TABLE public.water_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON public.water_readings
  FOR ALL USING (true);

CREATE POLICY "Allow all for service role" ON public.water_alerts
  FOR ALL USING (true);
