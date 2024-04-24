import type { Database } from 'sqlite3'
import fs from 'node:fs'
import { v4 } from 'uuid'

declare const Library: PXIO.LibraryDecorator

export class RecycleBinModel {
  @Library('database') private database: Database
  @Library('paths') private paths: Paths.Class
  public async moveToRecycleBin(uuid: string, strPath: string, path: string[]) {
    const id = v4()
    const newPath = this.paths.getRecycleBinItem(uuid, id)
    fs.cpSync(strPath, newPath, { recursive: true })
    fs.rmSync(strPath, { recursive: true, force: true })
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    await new Promise<void>(resolve => this.database.run(
      'INSERT INTO recycle_bin (id, uuid, path, date) VALUES (?, ?, ?, ?)',
      [id, uuid, path.join('|'), `${year.toString()}/${month < 10 ? `0${month.toString()}` : month.toString()}/${day < 10 ? `0${day.toString()}` : day.toString()} ${hours < 10 ? `0${hours.toString()}` : hours.toString()}:${minutes < 10 ? `0${minutes.toString()}` : minutes.toString()}`],
      resolve
    ))
  }
  public async findByUUID(uuid: string): Promise<RecycleBin.Item[]> {
    const results = await new Promise<RecycleBin.Result[]>(resolve => this.database.all<RecycleBin.Result>(
      'SELECT * FROM recycle_bin WHERE uuid = ?',
      [uuid],
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    return results.map(item => ({
      id: item.id,
      uuid: item.uuid,
      path: item.path.split('|'),
      date: item.date
    }))
  }
  public async findByID(id: string): Promise<RecycleBin.Item | undefined> {
    const item = await new Promise<RecycleBin.Result | undefined>(resolve => this.database.get<RecycleBin.Result>(
      'SELECT * FROM recycle_bin WHERE id = ?',
      [id],
      (error, rows) => error ? resolve(undefined) : resolve(rows)
    ))
    let result: any = undefined
    if (item) {
      result = {
        id: item.id,
        uuid: item.uuid,
        path: item.path.split('|'),
        date: item.date
      }
    }
    return result
  }
  public async restore(uuid: string, id: string, path: string) {
    let newPath = path
    const oldPath = this.paths.getRecycleBinItem(uuid, id)
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
  private deleteFromDB(uuid: string, id?: string): Promise<void> {
    let strQuery = 'DELETE FROM recycle_bin WHERE uuid = ?'
    const opts = [uuid]
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
  public async delete(uuid: string, id: string) {
    const path = this.paths.getRecycleBinItem(uuid, id)
    fs.rmSync(path, { recursive: true, force: true })
    await this.deleteFromDB(uuid, id)
  }
  public async clean(uuid: string) {
    const path = this.paths.getRecycleBin(uuid)
    fs.rmSync(path, { recursive: true, force: true })
    await this.deleteFromDB(uuid)
  }
}