-- Create users profile table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',
  rank TEXT DEFAULT 'Seedling',
  achievements TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access on profiles" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual updates on profiles" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert on profiles" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create waste classification history log table
CREATE TABLE IF NOT EXISTS public.waste_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- recyclable, compostable, hazardous, landfill, e-waste
  confidence NUMERIC NOT NULL,
  carbon_footprint_kg NUMERIC NOT NULL,
  disposal_instructions TEXT[] DEFAULT '{}'::text[],
  reuse_ideas TEXT[] DEFAULT '{}'::text[],
  alternatives TEXT[] DEFAULT '{}'::text[],
  environmental_reasoning TEXT DEFAULT '',
  sustainability_score INTEGER DEFAULT 0,
  image_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for waste logs
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own waste logs" 
  ON public.waste_logs FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Create community feed posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for community posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on posts" 
  ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Users can create posts" 
  ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Profile trigger to create profile row automatically when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, xp, level, streak, language, rank, achievements)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'EcoWarrior_' || substr(NEW.id::text, 1, 6)),
    0,
    1,
    0,
    'en',
    'Seedling',
    '{}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
