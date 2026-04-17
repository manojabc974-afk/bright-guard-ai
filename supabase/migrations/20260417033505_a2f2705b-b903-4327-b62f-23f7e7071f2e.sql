
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  url text NOT NULL,
  threat_type text NOT NULL DEFAULT 'phishing',
  description text,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reports" ON public.community_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can submit reports" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can update their own reports" ON public.community_reports FOR UPDATE TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Users can delete their own reports" ON public.community_reports FOR DELETE TO authenticated USING (auth.uid() = reporter_id);

CREATE TABLE public.report_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.community_reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_id)
);

ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view votes" ON public.report_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.report_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.report_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_report_upvotes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_reports SET upvotes = upvotes + 1 WHERE id = NEW.report_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_reports SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.report_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON public.report_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_report_upvotes();

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reports;
