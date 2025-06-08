-- Enable pgcrypto extension if not already enabled (for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Users table (profiles linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL, -- Populated from auth.users.email
  username TEXT UNIQUE NOT NULL, -- Must be unique, populated from metadata or during onboarding
  display_name TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  twitter_handle TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE public.users IS 'User profile information, linked to Supabase auth users.';

-- Function to copy user data from auth.users to public.users on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public -- Important for security
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username'); -- Assuming username is passed in raw_user_meta_data
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for a new user.';

-- Trigger to call handle_new_user on new auth.users entry
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  followee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, followee_id)
);
COMMENT ON TABLE public.follows IS 'Stores user follow relationships.';

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.categories IS 'Content categories for challenges and luxicles.';

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.tags IS 'User-generated tags for content.';

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rules TEXT,
  category_id UUID REFERENCES public.categories(id),
  cover_image_url TEXT,
  opens_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closes_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT FALSE,
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.challenges IS 'Monthly challenges for users to participate in.';

-- Challenge tags junction table
CREATE TABLE public.challenge_tags (
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (challenge_id, tag_id)
);
COMMENT ON TABLE public.challenge_tags IS 'Junction table for challenges and tags.';

-- Luxicles table (user submissions to challenges)
CREATE TABLE public.luxicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id), -- Optional, could inherit from challenge
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.luxicles IS 'User-created content collections (submissions).';

-- Luxicle tags junction table
CREATE TABLE public.luxicle_tags (
  luxicle_id UUID REFERENCES public.luxicles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (luxicle_id, tag_id)
);
COMMENT ON TABLE public.luxicle_tags IS 'Junction table for luxicles and tags.';

-- Luxicle items table (individual items within a luxicle)
CREATE TABLE public.luxicle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  luxicle_id UUID REFERENCES public.luxicles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order of the item within the luxicle
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT, -- URL for images, videos, etc.
  embed_provider TEXT, -- e.g., 'youtube', 'spotify', 'soundcloud'
  embed_data JSONB, -- Store oEmbed response or other embed metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.luxicle_items IS 'Individual content items within a luxicle.';

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.messages IS 'Direct messages between users.';

-- Flags table (for reporting content)
CREATE TABLE public.flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  luxicle_id UUID REFERENCES public.luxicles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE public.flags IS 'User reports for inappropriate content.';

-- Indexes & Performance
CREATE INDEX idx_luxicles_user_id ON public.luxicles(user_id);
CREATE INDEX idx_luxicles_challenge_id ON public.luxicles(challenge_id);
CREATE INDEX idx_luxicles_created_at ON public.luxicles(created_at DESC);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_followee_id ON public.follows(followee_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_luxicle_items_luxicle_id ON public.luxicle_items(luxicle_id);

-- Full-text search indexes
CREATE INDEX idx_luxicles_search ON public.luxicles USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_users_search ON public.users USING gin(to_tsvector('english', username || ' ' || COALESCE(display_name, '') || ' ' || COALESCE(bio, '')));
CREATE INDEX idx_challenges_search ON public.challenges USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Row Level Security (RLS)

-- Enable RLS on all relevant tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luxicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luxicle_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luxicle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

-- Policies for 'users' table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
-- Ensure the handle_new_user trigger populates the username field correctly during signup.

-- Policies for 'follows' table
CREATE POLICY "Users can manage their own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Follows are publicly viewable" ON public.follows FOR SELECT USING (true);

-- Policies for 'categories' table
CREATE POLICY "Categories are publicly viewable" ON public.categories FOR SELECT USING (true);
-- Admin policies for CUD on categories would typically use a custom role or service_key.

-- Policies for 'tags' table
CREATE POLICY "Tags are publicly viewable" ON public.tags FOR SELECT USING (true);
-- Admin policies for CUD on tags.

-- Policies for 'challenges' table
CREATE POLICY "Challenges are publicly viewable" ON public.challenges FOR SELECT USING (true);
-- Admin policies for CUD on challenges.

-- Policies for 'challenge_tags' table
CREATE POLICY "Challenge tags are publicly viewable" ON public.challenge_tags FOR SELECT USING (true);
-- Admin policies for CUD.

-- Policies for 'luxicles' table
CREATE POLICY "Luxicles are publicly readable if published" ON public.luxicles FOR SELECT USING (is_published = true);
CREATE POLICY "Users can manage their own luxicles" ON public.luxicles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for 'luxicle_tags' table
CREATE POLICY "Luxicle tags are publicly viewable if luxicle is published" ON public.luxicle_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.luxicles l
    WHERE l.id = luxicle_tags.luxicle_id AND l.is_published = true
  )
);
CREATE POLICY "Users can manage tags for their own luxicles" ON public.luxicle_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.luxicles l
    WHERE l.id = luxicle_tags.luxicle_id AND l.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.luxicles l
    WHERE l.id = luxicle_tags.luxicle_id AND l.user_id = auth.uid()
  )
);

-- Policies for 'luxicle_items' table
CREATE POLICY "Luxicle items are publicly readable if luxicle is published" ON public.luxicle_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.luxicles l
    WHERE l.id = luxicle_items.luxicle_id AND l.is_published = true
  )
);
CREATE POLICY "Users can manage items for their own luxicles" ON public.luxicle_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.luxicles l
    WHERE l.id = luxicle_items.luxicle_id AND l.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.luxicles l
    WHERE l.id = luxicle_items.luxicle_id AND l.user_id = auth.uid()
  )
);

-- Policies for 'messages' table
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages to mutual followers" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.follows f1
    JOIN public.follows f2 ON f1.follower_id = f2.followee_id AND f1.followee_id = f2.follower_id
    WHERE f1.follower_id = auth.uid() AND f1.followee_id = receiver_id
  )
);

-- Policies for 'flags' table
CREATE POLICY "Users can create flags for luxicles" ON public.flags FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reported flags" ON public.flags FOR SELECT USING (auth.uid() = reporter_id);
-- Admin policies for reviewing/managing flags.

-- Grant usage on schema public to supabase_auth_admin (needed for trigger)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.users TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Grant basic permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant select permissions to anon role for publicly viewable data (RLS policies will enforce specifics)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.follows TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.tags TO anon;
GRANT SELECT ON public.challenges TO anon;
GRANT SELECT ON public.challenge_tags TO anon;
GRANT SELECT ON public.luxicles TO anon;
GRANT SELECT ON public.luxicle_tags TO anon;
GRANT SELECT ON public.luxicle_items TO anon;

