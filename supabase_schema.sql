-- =========================================================
-- 1. ENUMS & EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE painting_status_enum AS ENUM ('available', 'sold', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================================
-- 2. TABLES CREATION & MIGRATION
-- =========================================================

CREATE TABLE IF NOT EXISTS public.paintings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    type VARCHAR(100),
    category VARCHAR(100),
    medium VARCHAR(100),
    status painting_status_enum NOT NULL DEFAULT 'available',
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    medium_details TEXT,
    year INT DEFAULT 2024,
    featured BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ensure all optional and new columns exist
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS medium VARCHAR(100);
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS type VARCHAR(100);
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS medium_details TEXT;
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS year INT DEFAULT 2024;
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.paintings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    painting_id UUID REFERENCES public.paintings(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_city VARCHAR(150),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reference_image TEXT,
    custom_dimensions VARCHAR(100),
    budget_range VARCHAR(100),
    artwork_title VARCHAR(255)
);

ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS reference_image TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS custom_dimensions VARCHAR(100);
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS budget_range VARCHAR(100);
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS artwork_title VARCHAR(255);

-- =========================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =========================================================

ALTER TABLE public.paintings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public paintings are viewable by everyone" ON public.paintings;
DROP POLICY IF EXISTS "Allow insert paintings" ON public.paintings;
DROP POLICY IF EXISTS "Allow update paintings" ON public.paintings;
DROP POLICY IF EXISTS "Allow delete paintings" ON public.paintings;

CREATE POLICY "Public paintings are viewable by everyone" 
ON public.paintings FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow insert paintings" 
ON public.paintings FOR INSERT TO public, anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow update paintings" 
ON public.paintings FOR UPDATE TO public, anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete paintings" 
ON public.paintings FOR DELETE TO public, anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow view enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow delete enquiries" ON public.enquiries;

CREATE POLICY "Anyone can insert enquiries" 
ON public.enquiries FOR INSERT TO public, anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow view enquiries" 
ON public.enquiries FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow update enquiries" 
ON public.enquiries FOR UPDATE TO public, anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete enquiries" 
ON public.enquiries FOR DELETE TO public, anon, authenticated USING (true);

-- =========================================================
-- 4. STORAGE BUCKETS & OBJECT POLICIES
-- =========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('painting-images', 'painting-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('inquiry-reference-images', 'inquiry-reference-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access for Painting Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Painting Images Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Painting Images Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Painting Images Deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for Inquiry Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Inquiry Images Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Inquiry Images Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Inquiry Images Deletes" ON storage.objects;

CREATE POLICY "Public Access for Painting Images"
ON storage.objects FOR SELECT TO public, anon, authenticated
USING (bucket_id = 'painting-images');

CREATE POLICY "Allow Painting Images Uploads"
ON storage.objects FOR INSERT TO public, anon, authenticated
WITH CHECK (bucket_id = 'painting-images');

CREATE POLICY "Allow Painting Images Updates"
ON storage.objects FOR UPDATE TO public, anon, authenticated
USING (bucket_id = 'painting-images');

CREATE POLICY "Allow Painting Images Deletes"
ON storage.objects FOR DELETE TO public, anon, authenticated
USING (bucket_id = 'painting-images');

CREATE POLICY "Public Access for Inquiry Images"
ON storage.objects FOR SELECT TO public, anon, authenticated
USING (bucket_id = 'inquiry-reference-images');

CREATE POLICY "Allow Inquiry Images Uploads"
ON storage.objects FOR INSERT TO public, anon, authenticated
WITH CHECK (bucket_id = 'inquiry-reference-images');

CREATE POLICY "Allow Inquiry Images Updates"
ON storage.objects FOR UPDATE TO public, anon, authenticated
USING (bucket_id = 'inquiry-reference-images');

CREATE POLICY "Allow Inquiry Images Deletes"
ON storage.objects FOR DELETE TO public, anon, authenticated
USING (bucket_id = 'inquiry-reference-images');
