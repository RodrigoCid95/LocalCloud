CREATE TABLE groups_to_permissions (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "id_group" INTEGER NOT NULL,
    "id_permission" INTEGER NOT NULL,
    FOREIGN KEY ("id_group") REFERENCES groups ("id_group") ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY ("id_permission") REFERENCES permissions ("id_permission") ON UPDATE CASCADE ON DELETE CASCADE
);