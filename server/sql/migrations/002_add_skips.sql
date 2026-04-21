-- Migration 002: skips テーブル追加（左スワイプ記録）
-- Apply: psql -U postgres -d anchor_dev -f server/sql/migrations/002_add_skips.sql

CREATE TABLE IF NOT EXISTS skips (
  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_skips_from_user ON skips(from_user_id);
