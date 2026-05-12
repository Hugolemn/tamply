DROP POLICY IF EXISTS "Authenticated upload shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Owner update shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Owner select shop logos" ON storage.objects;

CREATE POLICY "Owner select shop logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated upload shop logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner update shop logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner delete shop logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);