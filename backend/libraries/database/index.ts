import type { sqlite3, Database } from 'sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { verbose } from 'sqlite3'
import { v4, v5 } from 'uuid'
import users from './users.sql'
import apps from './apps.sql'
import users_to_apps from './users_to_apps.sql'

declare const configs: PXIO.Configs
declare const moduleEmitters: PXIO.Emitters

export const database: () => Promise<Database> = async (): Promise<Database> => {
  await new Promise(resolve => moduleEmitters.on('Paths:ready', resolve))
  const database: Database.Config = configs.get('database')
  const paths: Paths.Config = configs.get('paths')
  const sqlite3: sqlite3 = verbose()
  const connector = new sqlite3.Database(database.path)
  await new Promise(resolve => connector.run(users, resolve))
  await new Promise(resolve => connector.run(apps, resolve))
  await new Promise(resolve => connector.run(users_to_apps, resolve))
  const results: Users.Result[] = await new Promise(resolve => connector.all<Users.Result>('SELECT * FROM users', (...args) => resolve(args[1])))
  if (results.length === 0) {
    const uuid: string = v4()
    const password_hash: string = v5('A.1b2c3d4', uuid)
    await new Promise(resolve => connector.run(`INSERT INTO users ( uuid, user_name, full_name, photo, email, phone, password_hash ) VALUES ( '${uuid}', 'admin', 'Admin', '', '', '', '${password_hash}' );`, resolve))
    fs.mkdirSync(path.join(paths.users.path, uuid))
  }
  return connector
}