import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class PermissionsModel {
  @Library('database') private database: Database
  public async setActive(id: number, active: boolean): Promise<void> {
    await new Promise(resolve => this.database.run(
      'UPDATE permissions set active = ? WHERE id_permission = ?',
      [active, id],
      resolve
    ))
  }
}