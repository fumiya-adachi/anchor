-- Migration 001: profiles テーブル拡張 + interests テーブル追加
-- Apply: psql -U postgres -d anchor_dev -f server/sql/migrations/001_extend_profiles.sql

-- profiles テーブルにカラム追加
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS height            INTEGER,
  ADD COLUMN IF NOT EXISTS weight            INTEGER,
  ADD COLUMN IF NOT EXISTS experience_years  INTEGER,
  ADD COLUMN IF NOT EXISTS frequency_per_week VARCHAR(20),
  ADD COLUMN IF NOT EXISTS training_time      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS level              VARCHAR(20)
    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS bench_press       INTEGER,
  ADD COLUMN IF NOT EXISTS squat             INTEGER,
  ADD COLUMN IF NOT EXISTS deadlift          INTEGER,
  ADD COLUMN IF NOT EXISTS goals             TEXT[],
  ADD COLUMN IF NOT EXISTS tags              JSONB,
  ADD COLUMN IF NOT EXISTS gym_name          VARCHAR(255);

-- interests マスタテーブル
CREATE TABLE IF NOT EXISTS interests (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50)  NOT NULL
);

-- profile_interests 中間テーブル（多対多）
CREATE TABLE IF NOT EXISTS profile_interests (
  profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id INTEGER NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, interest_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_interests_profile  ON profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_interest ON profile_interests(interest_id);

-- interests マスタデータ初期投入
INSERT INTO interests (name, category) VALUES
  -- フィットネス
  ('Running',       'fitness'),
  ('Cycling',       'fitness'),
  ('Yoga',          'fitness'),
  ('Swimming',      'fitness'),
  ('Hiking',        'fitness'),
  ('CrossFit',      'fitness'),
  ('Martial Arts',  'fitness'),
  -- 趣味
  ('Cooking',       'hobby'),
  ('Reading',       'hobby'),
  ('Gaming',        'hobby'),
  ('Music',         'hobby'),
  ('Travel',        'hobby'),
  ('Photography',   'hobby'),
  ('Movies',        'hobby'),
  ('Art',           'hobby'),
  -- ライフスタイル
  ('Coffee',        'lifestyle'),
  ('Craft Beer',    'lifestyle'),
  ('Wine',          'lifestyle'),
  ('Veganism',      'lifestyle'),
  ('Meditation',    'lifestyle')
ON CONFLICT (name) DO NOTHING;
