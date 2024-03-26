CREATE TABLE permissions (
    id_permission INTEGER PRIMARY KEY AUTOINCREMENT,
    package_name TEXT REFERENCES apps (package_name) ON DELETE CASCADE ON UPDATE CASCADE,
    api TEXT NOT NULL,
    justification TEXT NOT NULL,
    active INTEGER NOT NULL
);