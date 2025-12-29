-- Migration: Create Rituals Tables
-- Date: 2025-12-29
-- Feature: Daily Rituals System ("Rituales")

-- ============================================
-- 1. RITUALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '✨',
  color TEXT DEFAULT '#FF69B4',
  
  -- Scheduling
  time TIME NOT NULL,
  recurrence TEXT NOT NULL DEFAULT 'daily' CHECK (recurrence IN ('daily', 'weekdays', 'weekends', 'custom')),
  days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  snooze_minutes INTEGER DEFAULT 10,
  
  -- State
  is_active BOOLEAN DEFAULT true,
  streak_count INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_completed_at TIMESTAMPTZ
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_rituals_user_active ON rituals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rituals_time ON rituals(time);

-- RLS Policy: Users can only access their own rituals
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own rituals" ON rituals;
CREATE POLICY "Users can CRUD own rituals" ON rituals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-set user_id on insert
CREATE OR REPLACE FUNCTION set_ritual_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ritual_user_id ON rituals;
CREATE TRIGGER trigger_set_ritual_user_id
  BEFORE INSERT ON rituals
  FOR EACH ROW
  EXECUTE FUNCTION set_ritual_user_id();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ritual_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ritual_timestamp ON rituals;
CREATE TRIGGER trigger_update_ritual_timestamp
  BEFORE UPDATE ON rituals
  FOR EACH ROW
  EXECUTE FUNCTION update_ritual_timestamp();

-- ============================================
-- 2. RITUAL COMPLETIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id UUID REFERENCES rituals(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  note TEXT
);

-- Unique constraint: one completion per day per ritual
CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_ritual_date 
  ON ritual_completions(ritual_id, (completed_at::date));

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_completions_ritual ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON ritual_completions(completed_at);

-- RLS Policy: Access via ritual ownership
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own completions" ON ritual_completions;
CREATE POLICY "Users can access own completions" ON ritual_completions
  FOR ALL
  USING (
    ritual_id IN (SELECT id FROM rituals WHERE user_id = auth.uid())
  );

-- ============================================
-- 3. REALTIME SUBSCRIPTION
-- ============================================
-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE rituals;
ALTER PUBLICATION supabase_realtime ADD TABLE ritual_completions;
