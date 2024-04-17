import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class SourcesModel {
  @Library('database') private database: Database
  public async find(query?: Partial<SecureSources.Source>): Promise<SecureSources.Source[]> {
    let strQuery = 'SELECT * FROM secure_sources'
    const values: any[] = []
    if (query) {
      const where: string[] = []
      const entries = Object.entries(query)
      for (const [key, value] of entries) {
        where.push(`${key} = ?`)
        values.push(value)
      }
      strQuery += ` WHERE ${where.join(' AND ')}`
    }
    const results = await new Promise<SecureSources.Result[]>(resolve => this.database.all<SecureSources.Result>(
      strQuery,
      values,
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    return results.map(result => ({
      id: result.id_source,
      package_name: result.package_name,
      type: result.type,
      source: result.source,
      justification: result.justification,
      active: result.active
    }))
  }
  public async setActive(id: number, active: boolean): Promise<void> {
    await new Promise(resolve => this.database.run(
      'UPDATE secure_sources set active = ? WHERE id_source = ?',
      [active ? 1 : 0, id],
      resolve
    ))
  }
}