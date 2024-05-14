import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class SharedModel {
  @Library('database') private database: Database
  public async find(query?: Partial<Shared.Shared>): Promise<Shared.Shared[]> {
    let strQuery = 'SELECT * FROM shared'
    const opts: any[] = []
    if (query) {
      const where: string[] = []
      const entries = Object.entries(query)
      for (let [key, value] of entries) {
        if (key === 'path') {
          opts.push((value as string[]).join('|'))
        } else {
          opts.push(value)
        }
        where.push(`${key} = ?`)
      }
      strQuery += ` WHERE ${where.join(' AND ')};`
    }
    const results = await new Promise<Shared.Result[]>(resolve => this.database.all<Shared.Result>(
      strQuery,
      opts,
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    return results.map(item => ({
      id: item.id,
      uid: item.uid,
      path: item.path.split('|')
    }))
  }
  public create(shared: Shared.Shared): Promise<void> {
    return new Promise(resolve => this.database.run(
      'INSERT INTO shared ( id, uid, path ) VALUES (?, ?, ?)',
      [shared.id, shared.uid, shared.path.join('|')],
      resolve
    ))
  }
  public delete(id: Shared.Shared['id']): Promise<void> {
    return new Promise(resolve => this.database.run(
      'DELETE FROM shared WHERE id = ?',
      [id],
      resolve
    ))
  }
}