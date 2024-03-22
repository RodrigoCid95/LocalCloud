CREATE TABLE if NOT EXISTS apps (
    package_name TEXT    UNIQUE,
    title        TEXT    NOT NULL,
    description  TEXT,
    author       TEXT    NOT NULL,
    icon         TEXT    NOT NULL,
    permissions  TEXT,
    font         TEXT,
    img          TEXT,
    connect      TEXT,
    script       TEXT
);