-- Phase 9: Points Economy & Hybrid Model

-- 1. Add Entry Cost and Video URL to Drops
ALTER TABLE drops 
ADD COLUMN IF NOT EXISTS entry_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS winner_video_url TEXT;

-- 2. Signup Bonus Trigger (20 Points)
-- First, ensure we have a function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, points, role)
  VALUES (new.id, new.email, 20, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new auth.users
-- Note: This assumes you might already have a similar trigger. 
-- If so, we'd need to update it. 
-- For safety, I will drop the trigger if it exists and recreate it to ensure the points are 20.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Point Transactions Table (Audit Log)
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount INTEGER NOT NULL, -- Positive for earn, Negative for spend
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Transactions
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
ON point_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Only Service Role can insert transactions (for integrity)
-- No insert policy for public/authenticated users.
