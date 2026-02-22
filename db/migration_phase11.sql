-- Phase 11: Everything - Database Migration
-- Run this in Supabase SQL Editor

-- Comments on drops
CREATE TABLE IF NOT EXISTS drop_comments (
    id SERIAL PRIMARY KEY,
    drop_id INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'win', 'drop_new', 'streak', 'referral', 'achievement', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    link TEXT, -- optional link to navigate to
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE drop_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Comments are public" ON drop_comments FOR SELECT USING (true);
CREATE POLICY "Authed users can comment" ON drop_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own notifications" ON notifications FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_drop_comments_drop_id ON drop_comments(drop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
