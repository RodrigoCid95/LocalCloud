import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class ProfileModel {
  @Library('database') private database: Database
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
}