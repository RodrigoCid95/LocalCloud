import type { Database } from 'sqlite3'
import fs from 'node:fs'
import { v4 } from 'uuid'

declare const Library: PXIO.LibraryDecorator

export class RecycleBinModel {
  @Library('database') private database: Database
  @Library('paths') private paths: Paths.Class
  public async moveToRecycleBin(user: Users.User, strPath: string, path: string[]) {
    const id = v4()
    const newPath = this.paths.getRecycleBinItem(user.name, id)
    fs.cpSync(strPath, newPath, { recursive: true })
    fs.rmSync(strPath, { recursive: true, force: true })
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    await new Promise<void>(resolve => this.database.run(
      'INSERT INTO recycle_bin (id, uid, path, date) VALUES (?, ?, ?, ?)',
      [id, user.uid, path.join('|'), `${year.toString()}/${month < 10 ? `0${month.toString()}` : month.toString()}/${day < 10 ? `0${day.toString()}` : day.toString()} ${hours < 10 ? `0${hours.toString()}` : hours.toString()}:${minutes < 10 ? `0${minutes.toString()}` : minutes.toString()}`],
      resolve
    ))
  }
  public async findByUID(uid: Users.User['uid']): Promise<RecycleBin.Item[]> {
    const results = await new Promise<RecycleBin.Result[]>(resolve => this.database.all<RecycleBin.Result>(
      'SELECT * FROM recycle_bin WHERE uid = ?',
      [uid],
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    return results.map(item => ({
      id: item.id,
      uid: item.uid,
      path: item.path.split('|'),
      date: item.date
    }))
  }
  public async findByID(id: RecycleBin.Item['id']): Promise<RecycleBin.Item | undefined> {
    const item = await new Promise<RecycleBin.Result | undefined>(resolve => this.database.get<RecycleBin.Result>(
      'SELECT * FROM recycle_bin WHERE id = ?',
      [id],
      (error, rows) => error ? resolve(undefined) : resolve(rows)
    ))
    let result: any = undefined
    if (item) {
      result = {
        id: item.id,
        uuid: item.uid,
        path: item.path.split('|'),
        date: item.date
      }
    }
    return result
  }
  public async restore(name: Users.User['name'], id: RecycleBin.Item['id'], path: string) {
    let newPath = path
    const oldPath = this.paths.getRecycleBinItem(name, id)
    const stat = fs.statSync(oldPath)
    const isFile = stat.isFile()
    if (isFile) {
      while (fs.existsSync(newPath)) {
        const segments = newPath.split('.')
        const ext = segments.pop()
        newPath = `${segments.join('.')}-restaurado.${ext}`
      }
    } else {
      while (fs.existsSync(newPath)) {
        newPath += '-restaurado'
      }
    }
    fs.cpSync(oldPath, newPath, { recursive: true })
    fs.rmSync(oldPath, { recursive: true, force: true })
    await new Promise<void>(resolve => this.database.run(
      'DELETE FROM recycle_bin WHERE id = ?',
      [id],
      resolve
    ))
  }
  private deleteFromDB(uid: Users.User['uid'], id?: RecycleBin.Item['id']): Promise<void> {
    let strQuery = 'DELETE FROM recycle_bin WHERE uid = ?'
    const opts: any[] = [uid]
    if (id) {
      strQuery += ' AND id = ?'
      opts.push(id)
    }
    return new Promise(resolve => this.database.run(
      strQuery,
      opts,
      resolve
    ))
  }
  public async delete(user: Users.User, id: RecycleBin.Item['id']) {
    const path = this.paths.getRecycleBinItem(user.name, id)
    fs.rmSync(path, { recursive: true, force: true })
    await this.deleteFromDB(user.uid, id)
  }
  public async clean(user: Users.User) {
    const path = this.paths.getRecycleBin(user.name)
    fs.rmSync(path, { recursive: true, force: true })
    await this.deleteFromDB(user.uid)
  }
}