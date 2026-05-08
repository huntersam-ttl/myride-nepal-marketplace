-- Enums
CREATE TYPE public.app_role AS ENUM ('user', 'dealer', 'admin');
CREATE TYPE public.listing_status AS ENUM ('pending', 'active', 'sold', 'rejected');
CREATE TYPE public.bike_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'poor');
CREATE TYPE public.fuel_type AS ENUM ('petrol', 'electric', 'hybrid');
CREATE TYPE public.bike_type AS ENUM ('sport', 'commuter', 'scooter', 'cruiser', 'off-road', 'touring');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table to avoid privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Dealer profiles
CREATE TABLE public.dealer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  brands TEXT[] DEFAULT '{}',
  service_area TEXT[] DEFAULT '{}',
  logo_url TEXT,
  banner_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dealer_profiles ENABLE ROW LEVEL SECURITY;

-- Listings
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  condition bike_condition NOT NULL,
  fuel_type fuel_type NOT NULL DEFAULT 'petrol',
  bike_type bike_type NOT NULL DEFAULT 'commuter',
  price BIGINT NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  colour TEXT,
  district TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  status listing_status NOT NULL DEFAULT 'pending',
  featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_brand ON public.listings(brand);
CREATE INDEX idx_listings_district ON public.listings(district);

-- Saved listings
CREATE TABLE public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Price estimates (base prices)
CREATE TABLE public.price_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  base_price BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brand, model)
);
ALTER TABLE public.price_estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- profiles
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Roles viewable by all" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- dealer_profiles
CREATE POLICY "Dealer profiles viewable by all" ON public.dealer_profiles FOR SELECT USING (true);
CREATE POLICY "Dealers manage own profile" ON public.dealer_profiles FOR ALL USING (auth.uid() = user_id);

-- listings
CREATE POLICY "Active listings viewable by all" ON public.listings FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete own listings" ON public.listings FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- saved_listings
CREATE POLICY "Users view own saves" ON public.saved_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saves" ON public.saved_listings FOR ALL USING (auth.uid() = user_id);

-- blog_posts
CREATE POLICY "Published posts viewable by all" ON public.blog_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage blog" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- price_estimates
CREATE POLICY "Price estimates viewable by all" ON public.price_estimates FOR SELECT USING (true);
CREATE POLICY "Admins manage price estimates" ON public.price_estimates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

CREATE POLICY "Listing images viewable by all" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Authenticated users upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');
CREATE POLICY "Users delete own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);