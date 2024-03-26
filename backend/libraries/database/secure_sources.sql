CREATE TABLE secure_sources (
  id_source INTEGER PRIMARY KEY AUTOINCREMENT,
  package_name TEXT REFERENCES apps (package_name) ON DELETE CASCADE ON UPDATE CASCADE,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  justification TEXT NOT NULL,
  active INTEGER DEFAULT (0)
);