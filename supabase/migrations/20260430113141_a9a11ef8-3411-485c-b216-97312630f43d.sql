
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read shop logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-logos');

CREATE POLICY "Authenticated upload shop logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner update shop logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner delete shop logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
