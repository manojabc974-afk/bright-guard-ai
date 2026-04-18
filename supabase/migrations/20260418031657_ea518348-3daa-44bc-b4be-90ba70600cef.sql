CREATE TABLE public.app_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  install_source TEXT NOT NULL DEFAULT 'unknown',
  result TEXT NOT NULL DEFAULT 'safe',
  risk_score INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_installs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own app installs" ON public.app_installs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own app installs" ON public.app_installs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own app installs" ON public.app_installs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_app_installs_user_created ON public.app_installs(user_id, created_at DESC);