CREATE TABLE IF NOT EXISTS recycle_bin (
  id TEXT PRIMARY KEY,
  user_name TEXT,
  path TEXT NOT NULL,
  date TEXT NOT NULL
);