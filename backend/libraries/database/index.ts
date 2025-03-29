import { Database } from 'sqlite3'
import recycle_bin from './recycle_bin.sql'
import shared from './shared.sql'
import apps from './apps.sql'
import users_to_apps from './users_to_apps.sql'
import permissions from './permissions.sql'
import secure_sources from './secure_sources.sql'

export class DataBase extends Database {
  constructor() {
    const database: Database.Config = getConfig('database')
    super(database.path)
    this.run(recycle_bin)
    this.run(shared)
    this.run(apps)
    this.run(users_to_apps)
    this.run(permissions)
    this.run(secure_sources)
  }
}