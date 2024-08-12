import type { Collection, Db, Filter } from 'mongodb'
import { ObjectId } from 'mongodb'

declare const Library: PXIO.LibraryDecorator

export class PermissionsModel {
  @Library('mongo') private db: Db
  private get collection(): Collection<Permissions.Permission> {
    return this.db.collection<Permissions.Permission>('permissions')
  }
  public async find(query: Filter<Permissions.Permission> = {}): Promise<Permissions.Permission[]> {
    return this.collection
      .find(query)
      .toArray()
      .then(results => results.map(({ _id, package_name, api, justification, active }) => ({ id: _id.toString(), package_name, api, justification, active })))
  }
  public async setActive(id: Permissions.Permission['id'], active: Permissions.Permission['active']): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { active } })
  }
}