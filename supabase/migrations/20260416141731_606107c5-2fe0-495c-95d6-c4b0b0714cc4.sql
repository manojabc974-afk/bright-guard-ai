
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe', 'suspicious', 'phishing')),
  score INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  indicators JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" ON public.scan_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scans" ON public.scan_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
