CREATE TABLE users_to_groups (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "id_user" TEXT NOT NULL,
    "id_group" INTEGER NOT NULL,
    FOREIGN KEY ("id_user") REFERENCES users ("id_user") ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY ("id_group") REFERENCES groups ("id_group") ON UPDATE CASCADE ON DELETE CASCADE
);