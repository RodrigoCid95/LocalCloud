CREATE TABLE IF NOT EXISTS apps (
    package_name TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    extensions TEXT,
    use_storage INTEGER
);