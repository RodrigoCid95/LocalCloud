import type { DataBasesLib } from 'interfaces/DataBases'
import { Lib } from 'phoenix-js/core'

export class IndexModel {
  @Lib('databases') private databases: DataBasesLib
  public async checkInstallation(): Promise<boolean> {
    try {
      this.databases.getConnector({})
    } catch (error) {
      return false
    }
    return true
  }
  public createDatabase(): Promise<void> {
    return this.databases.createDB({
      queries: [
        'CREATE TABLE IF NOT EXISTS "users" ( "uuid" TEXT NOT NULL UNIQUE, "user_name" TEXT NOT NULL UNIQUE, "full_name" TEXT, "password_hash" TEXT NOT NULL, "photo" TEXT, "email" TEXT, "phone" TEXT, PRIMARY KEY("uuid") );',
        'CREATE TABLE IF NOT EXISTS "roles" ( "id_rol" INTEGER, "name" TEXT NOT NULL UNIQUE, "description" TEXT, "permissions" TEXT NOT NULL, PRIMARY KEY("id_rol" AUTOINCREMENT) );',
        'CREATE TABLE IF NOT EXISTS "apps" ( "id_app" INTEGER, "package_name" TEXT NOT NULL UNIQUE, "title" TEXT NOT NULL, "description" TEXT, "author" TEXT, "icon" TEXT, "dependences" TEXT NOT NULL, "font" TEXT, "img" TEXT, "connect" TEXT, "script" TEXT, PRIMARY KEY("id_app" AUTOINCREMENT) );',
        'CREATE TABLE IF NOT EXISTS "roles_users" ( "id_rol"	INTEGER, "uuid" TEXT, FOREIGN KEY("uuid") REFERENCES "users"("uuid"), FOREIGN KEY("id_rol") REFERENCES "roles"("id_rol") );',
        'CREATE TABLE IF NOT EXISTS "roles_apps" ( "id_rol" INTEGER, "id_app" INTEGER, FOREIGN KEY("id_rol") REFERENCES roles(id_rol), FOREIGN KEY("id_app") REFERENCES apps(id_app) );',
      ]
    })
    /* `INSERT INTO users ("uuid", "user_name", "password_hash", "photo", "email", "phone") VALUES ("${idAdmin}", "admin", "${crypto.createHmac('sha1', idAdmin).update('password').digest('hex')}", "", "", "");`,
    'INSERT INTO roles ("name", "description", "permissions") VALUES ("admin", "Control total del sitema", "all");',
    `INSERT INTO roles_users ("id_rol", "uuid") VALUES (1, "${idAdmin}");`, */
  }
}
export * from './users'
export * from './roles'
export * from './apps'