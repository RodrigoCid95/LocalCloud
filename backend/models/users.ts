import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class UsersModel {
  @Library('database') private database: Database
  public async find(query?: Partial<Users.User>): Promise<Users.Result[]> {
    let strQuery = `SELECT * FROM users`
    const opts: any[] = []
    if (query) {
      const where: string[] = []
      const keys: Array<keyof Users.User> = Object.keys(query) as Array<keyof Users.User>
      for (const key of keys) {
        where.push(`${key} = ?`)
        opts.push(query[key])
      }
      strQuery += ` WHERE ${where.join(' AND ')}`
    }
    const results = await new Promise<Users.Result[]>(
      resolve =>
        this.database.all<Users.Result>(
          strQuery,
          opts,
          (error, rows) => error ? resolve([]) : resolve(rows)
        )
    )
    return results
  }
}