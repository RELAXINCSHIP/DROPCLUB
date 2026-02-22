-- Phase 10: Turn It Up - Database Migration
-- Run this in Supabase SQL Editor

-- Activity Feed table
CREATE TABLE IF NOT EXISTS activity_feed (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    event_type TEXT NOT NULL, -- 'entry', 'win', 'jackpot', 'signup', 'achievement'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements definitions
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- emoji
    category TEXT DEFAULT 'general', -- 'general', 'arcade', 'drops', 'social'
    requirement_value INTEGER DEFAULT 1,
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements (earned badges)
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points_awarded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referee_id) -- each user can only be referred once
);

-- Mystery box reward definitions
CREATE TABLE IF NOT EXISTS mystery_box_rewards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    reward_type TEXT NOT NULL, -- 'points', 'badge', 'merch_entry'
    reward_value INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 10, -- probability weight
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    icon TEXT DEFAULT '🎁',
    active BOOLEAN DEFAULT true
);

-- Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Generate referral codes for existing users
UPDATE profiles
SET referral_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
WHERE referral_code IS NULL;

-- Seed achievements
INSERT INTO achievements (slug, title, description, icon, category, requirement_value, points_reward) VALUES
    ('first_entry', 'First Drop', 'Enter your first drop', '🎯', 'drops', 1, 10),
    ('five_drops', 'Drop Fiend', 'Enter 5 drops', '🔥', 'drops', 5, 25),
    ('first_win', 'Winner Winner', 'Win your first drop', '🏆', 'drops', 1, 50),
    ('points_100', 'Hundo', 'Earn 100 lifetime points', '💯', 'general', 100, 0),
    ('points_1000', 'Thousandaire', 'Earn 1,000 lifetime points', '💰', 'general', 1000, 0),
    ('points_10000', 'Point God', 'Earn 10,000 lifetime points', '👑', 'general', 10000, 0),
    ('arcade_jackpot', 'Jackpot!', 'Hit a jackpot in the arcade', '🎰', 'arcade', 1, 0),
    ('streak_7', 'On Fire', 'Log in 7 days in a row', '🔥', 'general', 7, 20),
    ('streak_30', 'Dedicated', 'Log in 30 days in a row', '⭐', 'general', 30, 100),
    ('referral_1', 'Networker', 'Refer your first friend', '🤝', 'social', 1, 0),
    ('referral_5', 'Influencer', 'Refer 5 friends', '📢', 'social', 5, 50),
    ('mystery_box', 'Lucky Unboxer', 'Open your first mystery box', '📦', 'arcade', 1, 0)
ON CONFLICT (slug) DO NOTHING;

-- Seed mystery box rewards
INSERT INTO mystery_box_rewards (name, description, reward_type, reward_value, weight, rarity, icon) VALUES
    ('Small Bag', '10 bonus points', 'points', 10, 40, 'common', '💰'),
    ('Nice Bag', '25 bonus points', 'points', 25, 25, 'common', '💰'),
    ('Fat Stack', '50 bonus points', 'points', 50, 15, 'rare', '💎'),
    ('Mega Stack', '100 bonus points', 'points', 100, 10, 'rare', '💎'),
    ('Legendary Bag', '250 bonus points', 'points', 250, 5, 'epic', '🔥'),
    ('MOTHERLODE', '500 bonus points', 'points', 500, 3, 'epic', '👑'),
    ('Jackpot Box', '1000 bonus points', 'points', 1000, 2, 'legendary', '🏆')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_box_rewards ENABLE ROW LEVEL SECURITY;

-- Policies: everyone can read activity feed and achievements
CREATE POLICY "Activity feed is public" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "User achievements are public" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "Mystery rewards are public" ON mystery_box_rewards FOR SELECT USING (true);
CREATE POLICY "Users can see own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Auto-cleanup old activity feed entries (keep last 200)
CREATE OR REPLACE FUNCTION cleanup_activity_feed()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM activity_feed WHERE id NOT IN (
        SELECT id FROM activity_feed ORDER BY created_at DESC LIMIT 200
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS activity_feed_cleanup ON activity_feed;
CREATE TRIGGER activity_feed_cleanup
    AFTER INSERT ON activity_feed
    FOR EACH STATEMENT EXECUTE FUNCTION cleanup_activity_feed();
