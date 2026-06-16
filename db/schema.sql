-- D1 schema for F1Manager-Calc cloud sync + auth.
-- Replaces the previous Workers KV storage (KV's write limits were too strict).

-- Per-user cloud-sync blob (the redux-persist payload, JSON string).
-- uid = Discord id, or `u:<username>` for credentials-only users.
CREATE TABLE IF NOT EXISTS configs (
  uid        TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT 0
);

-- Username/password accounts. uid links a username to its identity:
--   fresh signup       -> uid = `u:<username>`
--   attached to Discord -> uid = the Discord id (shares that account's cloud data)
CREATE TABLE IF NOT EXISTS users (
  username   TEXT PRIMARY KEY,
  salt       TEXT NOT NULL,
  hash       TEXT NOT NULL,
  uid        TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
