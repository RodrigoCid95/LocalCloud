CREATE TABLE IF NOT EXISTS users_to_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid INTEGER,
    package_name REFERENCES apps (package_name) ON DELETE CASCADE ON UPDATE CASCADE
);