CREATE TABLE if NOT EXISTS users_to_apps (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid   REFERENCES users (uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    id_app REFERENCES apps (id_app) ON DELETE CASCADE ON UPDATE CASCADE
);