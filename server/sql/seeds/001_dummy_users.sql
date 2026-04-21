-- Seed: テスト用ダミーユーザー（スワイプ動作確認用）
-- Apply: psql -U postgres -d anchor_dev -f server/sql/seeds/001_dummy_users.sql

DO $$
DECLARE
  u1 INTEGER; u2 INTEGER; u3 INTEGER; u4 INTEGER; u5 INTEGER;
BEGIN

-- ── Users ──────────────────────────────────────────────────────
INSERT INTO users (cognito_id, email) VALUES
  ('dummy-001', 'keita@example.com'),
  ('dummy-002', 'ryota@example.com'),
  ('dummy-003', 'shun@example.com'),
  ('dummy-004', 'daiki@example.com'),
  ('dummy-005', 'haruki@example.com')
ON CONFLICT (cognito_id) DO NOTHING;

SELECT id INTO u1 FROM users WHERE cognito_id = 'dummy-001';
SELECT id INTO u2 FROM users WHERE cognito_id = 'dummy-002';
SELECT id INTO u3 FROM users WHERE cognito_id = 'dummy-003';
SELECT id INTO u4 FROM users WHERE cognito_id = 'dummy-004';
SELECT id INTO u5 FROM users WHERE cognito_id = 'dummy-005';

-- ── Profiles ───────────────────────────────────────────────────
INSERT INTO profiles (
  user_id, name, gender, birthdate, bio, gym_name,
  height, weight, level, experience_years,
  frequency_per_week, training_time,
  bench_press, squat, deadlift,
  goals, tags
) VALUES
(
  u1, 'Keita', 'male', '1997-04-12',
  'Powerlifting competitions are my main focus. Always chasing PRs.',
  'Muscle Factory Shibuya',
  178, 82, 'advanced', 6, '5-6', 'Morning 6-8',
  135, 180, 210,
  ARRAY['powerlifting', 'strength'],
  '[{"label":"Powerlifting","primary":true},{"label":"Heavy Lifts"},{"label":"Competition"}]'::jsonb
),
(
  u2, 'Ryota', 'male', '2000-09-03',
  'Bodybuilding is life. Cutting season never ends.',
  'Gold''s Gym Shinjuku',
  175, 78, 'intermediate', 4, '4-5', 'Evening 18-20',
  110, 140, 160,
  ARRAY['hypertrophy', 'cutting'],
  '[{"label":"Hypertrophy","primary":true},{"label":"Aesthetics"},{"label":"Meal Prep"}]'::jsonb
),
(
  u3, 'Shun', 'male', '1995-12-25',
  'CrossFit athlete. Box jumps and burpees are my love language.',
  'CrossFit Harajuku',
  172, 70, 'advanced', 7, '6-7', 'Morning 7-9',
  95, 130, 150,
  ARRAY['endurance', 'functional'],
  '[{"label":"CrossFit","primary":true},{"label":"Cardio"},{"label":"Olympic Lifts"}]'::jsonb
),
(
  u4, 'Daiki', 'male', '1999-06-18',
  'Just started lifting seriously 2 years ago. Loving every session.',
  'ANYTIME FITNESS Ebisu',
  180, 85, 'intermediate', 2, '3-4', 'Evening 19-21',
  90, 120, 140,
  ARRAY['hypertrophy', 'strength'],
  '[{"label":"Hypertrophy","primary":true},{"label":"Strength"}]'::jsonb
),
(
  u5, 'Haruki', 'male', '1993-02-07',
  'Calisthenics and weightlifting hybrid. Balance is everything.',
  'RIZAP Omotesando',
  170, 68, 'advanced', 9, '5', 'Morning 5-7',
  100, 145, 170,
  ARRAY['strength', 'flexibility'],
  '[{"label":"Calisthenics","primary":true},{"label":"Mobility"},{"label":"Mind-Muscle"}]'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- ── Interests ──────────────────────────────────────────────────
INSERT INTO profile_interests (profile_id, interest_id)
SELECT p.id, i.id
FROM profiles p, interests i
WHERE p.user_id = u1 AND i.name IN ('Running', 'Music', 'Coffee')
ON CONFLICT DO NOTHING;

INSERT INTO profile_interests (profile_id, interest_id)
SELECT p.id, i.id
FROM profiles p, interests i
WHERE p.user_id = u2 AND i.name IN ('Cooking', 'Photography', 'Travel')
ON CONFLICT DO NOTHING;

INSERT INTO profile_interests (profile_id, interest_id)
SELECT p.id, i.id
FROM profiles p, interests i
WHERE p.user_id = u3 AND i.name IN ('Hiking', 'Gaming', 'Music')
ON CONFLICT DO NOTHING;

INSERT INTO profile_interests (profile_id, interest_id)
SELECT p.id, i.id
FROM profiles p, interests i
WHERE p.user_id = u4 AND i.name IN ('Cooking', 'Movies', 'Craft Beer')
ON CONFLICT DO NOTHING;

INSERT INTO profile_interests (profile_id, interest_id)
SELECT p.id, i.id
FROM profiles p, interests i
WHERE p.user_id = u5 AND i.name IN ('Meditation', 'Reading', 'Art')
ON CONFLICT DO NOTHING;

END $$;
