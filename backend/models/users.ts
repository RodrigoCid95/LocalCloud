import type { Database } from 'sqlite3'
import fs from 'node:fs'

declare const Library: PXIO.LibraryDecorator

export class UsersModel {
  @Library('database') private database: Database
  @Library('paths') private paths: Paths.Class
  public assignAppToUser(uuid: Users.User['uuid'], package_name: Apps.App['package_name']): Promise<void> {
    return new Promise(resolve => this.database.run(
      'INSERT INTO users_to_apps (uuid, package_name) VALUES (?, ?);',
      [uuid, package_name],
      resolve
    ))
  }
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
      strQuery += ` WHERE ${where.join(' AND ')};`
    }
    const results = await new Promise<Users.Result[]>(resolve => this.database.all<Users.Result>(
      strQuery,
      opts,
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    return results
  }
  public async create(user: Users.New, uuid: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'INSERT INTO users (uuid, user_name, full_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?, ?);',
      [uuid, user.user_name, user.full_name, user.email, user.phone, user.password],
      resolve
    ))
    const userPath = this.paths.getUser(uuid)
    fs.mkdirSync(userPath, { recursive: true })
  }
  public async assignApp(uuid: string, package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'INSERT INTO users_to_apps (uuid, package_name) VALUES (?, ?);',
      [uuid, package_name],
      resolve
    ))
  }
  public async unassignApp(uuid: string, package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'DELETE FROM users_to_apps WHERE uuid = ? AND package_name = ?;',
      [uuid, package_name],
      resolve
    ))
  }
}