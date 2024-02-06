CREATE TABLE apps (
    "id_app" INTEGER PRIMARY KEY AUTOINCREMENT,
    "id_user" INTEGER NOT NULL,
    "package_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT,
    "icon" TEXT,
    "font" TEXT,
    "img" TEXT,
    "connect" TEXT,
    "script" TEXT,
    "manifest" TEXT,
    FOREIGN KEY ("id_user") REFERENCES users ("uuid") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX apps_package_name ON apps (package_name);