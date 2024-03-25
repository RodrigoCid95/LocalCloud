CREATE TABLE if NOT EXISTS users (
    uuid TEXT PRIMARY KEY NOT NULL,
    user_name TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    photo TEXT,
    email TEXT,
    phone TEXT,
    password_hash TEXT NOT NULL
);