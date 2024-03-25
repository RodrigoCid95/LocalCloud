CREATE TABLE permissions (
    id_permission INTEGER PRIMARY KEY AUTOINCREMENT,
    api TEXT NOT NULL,
    level INTEGER NOT NULL,
    description TEXT NOT NULL
);