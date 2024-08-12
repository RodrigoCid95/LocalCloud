import type { Collection, Db } from 'mongodb'
import { ObjectId } from 'mongodb'

declare const Library: PXIO.LibraryDecorator

export class SharedModel {
  @Library('mongo') private db: Db
  private get collection(): Collection<Omit<Shared.Shared, 'id'>> {
    return this.db.collection<Omit<Shared.Shared, 'id'>>('shared')
  }
  public async find(query: Partial<Shared.Shared> = {}): Promise<Shared.Shared[]> {
    const filter = {}
    const keys = Object.keys(query)
    for (const key of keys) {
      if (key === 'id') {
        filter['_id'] = new ObjectId(query[key])
      } else {
        filter[key] = query[key]
      }
    }
    const results = await this.collection.find(filter).toArray()
    return results.map(item => ({
      id: item._id.toString(),
      uid: item.uid,
      path: item.path
    }))
  }
  public async create(shared: Shared.New): Promise<void> {
    await this.collection.insertOne(shared)
  }
  public async delete(id: Shared.Shared['id']): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }
}