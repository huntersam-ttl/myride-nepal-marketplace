-- Add author_id and published_at columns to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Set author_id for existing posts (migrate from author text field)
-- This is a best-effort migration - you may need to adjust based on your data
UPDATE public.blog_posts
SET author_id = (SELECT id FROM auth.users LIMIT 1)
WHERE author_id IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);

-- Update published_at for already published posts
UPDATE public.blog_posts
SET published_at = created_at
WHERE published = true AND published_at IS NULL;
