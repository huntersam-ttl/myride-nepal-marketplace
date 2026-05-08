REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restrict storage SELECT policy (created above) to single-object access via direct path, not bucket listing
DROP POLICY IF EXISTS "Listing images viewable by all" ON storage.objects;
CREATE POLICY "Listing images viewable by all" ON storage.objects FOR SELECT USING (bucket_id = 'listings');