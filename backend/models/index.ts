import type { DataBasesLib } from 'interfaces/DataBases'
import { Lib } from 'phoenix-js/core'
import tables from './db'

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
      queries: tables
    })
    /* `INSERT INTO users ("uuid", "user_name", "password_hash", "photo", "email", "phone") VALUES ("${idAdmin}", "admin", "${crypto.createHmac('sha1', idAdmin).update('password').digest('hex')}", "", "", "");`,
    'INSERT INTO roles ("name", "description", "permissions") VALUES ("admin", "Control total del sitema", "all");',
    `INSERT INTO roles_users ("id_rol", "uuid") VALUES (1, "${idAdmin}");`, */
  }
}
export * from './users'
export * from './groups'
export * from './apps'