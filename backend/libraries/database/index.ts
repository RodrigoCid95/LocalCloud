import type { sqlite3, Database } from 'sqlite3'
import { verbose } from 'sqlite3'
import recycle_bin from './recycle_bin.sql'
import shared from './shared.sql'
import apps from './apps.sql'
import users_to_apps from './users_to_apps.sql'
import permissions from './permissions.sql'
import secure_sources from './secure_sources.sql'

export const database: () => Promise<Database> = async (): Promise<Database> => {
  const database: Database.Config = configs.get('database')
  const sqlite3: sqlite3 = verbose()
  const connector = new sqlite3.Database(database.path)
  await new Promise(resolve => connector.run(recycle_bin, resolve))
  await new Promise(resolve => connector.run(shared, resolve))
  await new Promise(resolve => connector.run(apps, resolve))
  await new Promise(resolve => connector.run(users_to_apps, resolve))
  await new Promise(resolve => connector.run(permissions, resolve))
  await new Promise(resolve => connector.run(secure_sources, resolve))
  return connector
}