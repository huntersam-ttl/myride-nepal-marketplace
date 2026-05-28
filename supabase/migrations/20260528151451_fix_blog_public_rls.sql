-- Fix public blog post reads after function execute hardening.
--
-- Cause:
-- The legacy "Published posts viewable by all" policy mixes public published
-- reads with public.has_role(auth.uid(), 'admin'). After Security Hardening 1A
-- revoked direct EXECUTE on has_role() from anon/public, anonymous blog reads can
-- fail with "permission denied for function has_role".
--
-- Safety:
-- - No tables are dropped.
-- - No data is deleted.
-- - Draft/unpublished posts remain hidden from anonymous users.
-- - Admin management is preserved without invoking has_role() on public reads.

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published posts viewable by all" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins manage blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Published blog posts viewable by all" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;

CREATE POLICY "Published blog posts viewable by all"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);
