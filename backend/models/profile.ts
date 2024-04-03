import type { Database } from 'sqlite3'
import fs from 'node:fs'

declare const Library: PXIO.LibraryDecorator

export class ProfileModel {
  @Library('database') private database: Database
  @Library('paths') private paths: Paths.Class
  public async update(newData: Partial<Users.Result>, uuid: string): Promise<void> {
    const keys: Array<keyof Users.User> = Object.keys(newData) as Array<keyof Users.User>
    if (keys.length > 0) {
      const values: any[] = []
      const fields = keys.map(key => {
        values.push(newData[key])
        return `${key} = ?`
      })
      await new Promise(
        resolve =>
          this.database.run(
            `UPDATE users SET ${fields.join(', ')} WHERE uuid = ?`,
            [...values, uuid],
            resolve
          )
      )
    }
  }
  public async delete(uuid: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'DELETE FROM users WHERE uuid = ?',
      [uuid],
      resolve
    ))
    await new Promise(resolve => this.database.run(
      'DELETE FROM users_to_apps WHERE uuid = ?',
      [uuid],
      resolve
    ))
    const userPath = this.paths.getUser(uuid)
    fs.rmSync(userPath, { recursive: true, force: true })
  }
}