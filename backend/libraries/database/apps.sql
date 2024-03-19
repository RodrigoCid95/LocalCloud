CREATE TABLE if NOT EXISTS apps (
    id_app       INTEGER PRIMARY KEY AUTOINCREMENT,
    package_name TEXT    UNIQUE,
    title        TEXT    NOT NULL,
    description  TEXT,
    author       TEXT    NOT NULL,
    icon         TEXT    NOT NULL,
    dependences  TEXT,
    font         TEXT,
    img          TEXT,
    connect      TEXT,
    script       TEXT
);