CREATE TABLE permissions (
    "id_permission" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL
);