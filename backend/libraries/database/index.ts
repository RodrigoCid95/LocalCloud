import type { sqlite3, Database } from 'sqlite3'
import { verbose } from 'sqlite3'
import { v4, v5 } from 'uuid'
import users from './users.sql'
import apps from './apps.sql'
import users_to_apps from './users_to_apps.sql'

declare const configs: PXIO.Configs

export const database: () => Promise<Database> = async (): Promise<Database> => {
  const { path }: Database.Config = configs.get('database')
  const sqlite3: sqlite3 = verbose()
  const connector = new sqlite3.Database(path)
  const uuid: string = v4()
  const password_hash: string = v5('A.1b2c3d4', uuid)
  await new Promise(resolve => connector.run(users, resolve))
  await new Promise(resolve => connector.run(apps, resolve))
  await new Promise(resolve => connector.run(users_to_apps, resolve))
  const results: Users.Result[] = await new Promise(resolve => connector.all<Users.Result>('SELECT * FROM users', (...args) => resolve(args[1])))
  if (results.length === 0) {
    await new Promise(resolve => connector.run(`INSERT INTO users ( uuid, user_name, full_name, photo, email, phone, password_hash ) VALUES ( '${uuid}', 'admin', 'Admin', '', '', '', '${password_hash}' );`, resolve))
  }
  return connector
}