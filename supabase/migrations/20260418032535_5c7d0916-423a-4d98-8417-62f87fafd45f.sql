CREATE TABLE public.leak_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  checked_value TEXT NOT NULL,
  found BOOLEAN NOT NULL DEFAULT false,
  breach_count INTEGER NOT NULL DEFAULT 0,
  breaches JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leak_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own leak scans" ON public.leak_scans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own leak scans" ON public.leak_scans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own leak scans" ON public.leak_scans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_leak_scans_user_created ON public.leak_scans(user_id, created_at DESC);