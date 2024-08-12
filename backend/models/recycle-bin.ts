import type { Collection, Db } from 'mongodb'
import { ObjectId } from 'mongodb'
import fs from 'node:fs'

declare const Library: PXIO.LibraryDecorator

export class RecycleBinModel {
  @Library('paths') private paths: Paths.Class
  @Library('mongo') private db: Db
  private get collection(): Collection<Omit<RecycleBin.Item, 'id'>> {
    return this.db.collection<Omit<RecycleBin.Item, 'id'>>('recycle_bin')
  }
  public async moveToRecycleBin(user: Users.User, strPath: string, path: string[]) {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const res = await this.collection.insertOne({
      uid: user.uid,
      path,
      date: `${year.toString()}/${month < 10 ? `0${month.toString()}` : month.toString()}/${day < 10 ? `0${day.toString()}` : day.toString()} ${hours < 10 ? `0${hours.toString()}` : hours.toString()}:${minutes < 10 ? `0${minutes.toString()}` : minutes.toString()}`,
    })
    const id = res.insertedId.toString()
    const newPath = this.paths.getRecycleBinItem(user.name, id)
    fs.cpSync(strPath, newPath, { recursive: true })
    fs.rmSync(strPath, { recursive: true, force: true })
  }
  public async findByUID(uid: Users.User['uid']): Promise<RecycleBin.Item[]> {
    const results = await this.collection.find({ uid }).toArray()
    return results.map(item => ({
      id: item._id.toString(),
      uid: item.uid,
      path: item.path,
      date: item.date
    }))
  }
  public async findByID(id: RecycleBin.Item['id']): Promise<RecycleBin.Item | null> {
    const result = await this.collection
      .findOne({ _id: new ObjectId(id) })
    if (result) {
      return {
        id: result._id.toString(),
        uid: result.uid,
        path: result.path,
        date: result.date
      }
    }
    return null
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
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }
  private async deleteFromDB(uid: Users.User['uid'], id?: RecycleBin.Item['id']): Promise<void> {
    const query = { uid }
    if (id) {
      query['_id'] = new ObjectId(id)
    }
    await this.collection.deleteMany(query)
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