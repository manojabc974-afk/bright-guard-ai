CREATE POLICY "Users can delete their own scans"
ON public.scan_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);