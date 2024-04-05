import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class SourcesModel {
  @Library('database') private database: Database
  public async setActive(id: number, active: boolean): Promise<void> {
    await new Promise(resolve => this.database.run(
      'UPDATE secure_sources set active = ? WHERE id_source = ?',
      [active ? 1 : 0, id],
      resolve
    ))
  }
}