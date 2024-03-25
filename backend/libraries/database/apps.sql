CREATE TABLE if NOT EXISTS apps (
    package_name TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    icon TEXT NOT NULL,
    font TEXT,
    img TEXT,
    connect TEXT,
    script TEXT
);