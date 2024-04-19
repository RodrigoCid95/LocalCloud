CREATE TABLE IF NOT EXISTS shared (
  id TEXT PRIMARY KEY,
  uuid REFERENCES users (uuid) ON DELETE CASCADE ON UPDATE CASCADE,
  path TEXT
);