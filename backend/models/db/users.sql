CREATE TABLE IF NOT EXISTS "users" (
  "uuid" TEXT PRIMARY KEY,
  "user_name" TEXT NOT NULL UNIQUE,
  "full_name" TEXT,
  "password_hash" TEXT NOT NULL,
  "photo" TEXT,
  "email" TEXT,
  "phone" TEXT
);