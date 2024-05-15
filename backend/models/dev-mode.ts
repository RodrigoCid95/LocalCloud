import type { Database } from 'sqlite3'
import fs from 'node:fs'
import { v4 } from 'uuid'

declare const Library: PXIO.LibraryDecorator

export class DevModeModel {
  @Library('devMode') public devMode: DevMode.Class
  @Library('database') public database: Database
  @Library('paths') paths: Paths.Class
  public getUser(): Users.User | undefined {
    const PASSWD_CONTENT = fs.readFileSync(this.paths.passwd, 'utf8')
    const PASSWD_LINES = PASSWD_CONTENT.split('\n').filter(line => line !== '')
    const USER_LIST = PASSWD_LINES.map(line => line.split(':'))
    const result = USER_LIST.find(us => us[0] === this.devMode.config.user)
    if (result) {
      const name = result[0]
      const [full_name = '', email = '', phone = ''] = result[4].split(',')
      return {
        uid: Number(result[2]),
        name,
        full_name,
        email,
        phone
      }
    }
  }
  public async getApps(uid: Users.User['uid']): Promise<LocalCloud.SessionData['apps']> {
    const apps: Apps.App[] = await new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT apps.package_name, apps.title, apps.description, apps.author FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uid = ?;',
      [uid || ''],
      (error, rows) => error ? resolve([]) : resolve(rows.map(result => ({
        package_name: result.package_name,
        title: result.title,
        description: result.description,
        author: result.author,
        extensions: (result.extensions || '').split('|')
      })))
    ))
    const appList: LocalCloud.SessionData['apps'] = {}
    for (const app of apps) {
      const sessionApp: LocalCloud.SessionApp = {
        token: v4(),
        ...app,
        secureSources: [],
        permissions: []
      }
      appList[app.package_name] = sessionApp
    }
    return appList
  }
}