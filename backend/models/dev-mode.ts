import type { Database } from 'sqlite3'
import { v4 } from 'uuid'

declare const Library: PXIO.LibraryDecorator

export class DevModeModel {
  @Library('devMode') public devMode: DevMode.Class
  @Library('database') public database: Database
  public async getUser(): Promise<Users.User | undefined> {
    const [result] = await new Promise<Users.Result[]>(resolve => this.database.all<Users.Result>(
      'SELECT * FROM users WHERE uuid = ?',
      [this.devMode.config.uuid],
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    if (result) {
      const { uuid, full_name, user_name, photo, email, phone } = result
      return { uuid, full_name, user_name, photo, email, phone }
    }
  }
  public async getApps(): Promise<LocalCloud.SessionData['apps']> {
    const apps: Apps.App[] = await new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT apps.package_name, apps.title, apps.description, apps.author FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uuid = ?;',
      [this.devMode.config.uuid],
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