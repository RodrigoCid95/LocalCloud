import type { Db, Collection } from 'mongodb'
import { ObjectId } from 'mongodb'

declare const Library: PXIO.LibraryDecorator

export class SourcesModel {
  @Library('mongo') private db: Db
  private get collection(): Collection<Omit<SecureSources.Source, 'id'>> {
    return this.db.collection<Omit<SecureSources.Source, 'id'>>('secure_sources')
  }
  public async find(query: Partial<SecureSources.Source> = {}): Promise<SecureSources.Source[]> {
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
    return results.map(result => ({
      id: result._id.toString(),
      package_name: result.package_name,
      type: result.type,
      source: result.source,
      justification: result.justification,
      active: result.active
    }))
  }
  public async setActive(id: SecureSources.Source['id'], active: boolean): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { active } })
  }
}