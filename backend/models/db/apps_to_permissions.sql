CREATE TABLE apps_to_permissions (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"id_app" INTEGER NOT NULL,
	"id_permission" INTEGER NOT NULL,
	"check" INTEGER NOT NULL,
	CONSTRAINT FK_apps_to_permissions_apps FOREIGN KEY ("id_app") REFERENCES apps("id_app") On UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FK_apps_to_permissions_permissions_2 FOREIGN KEY ("id_permission") REFERENCES permissions("id_permission") On UPDATE CASCADE ON DELETE CASCADE
);