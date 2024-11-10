import type { Database } from 'sqlite3'
import crypto from 'node:crypto'

export class DevModeModel {
  @Library('devMode') public devMode: DevMode.Class
  @Library('database') public database: Database
  @Library('userManager') private userManager: UserManager.Class
  public getUser(): Users.User | null {
    return this.userManager.get(this.devMode.user)
  }
  public async getApps(uid: Users.User['uid']): Promise<LocalCloud.SessionData['apps']> {
    const apps = await new Promise<Apps.App[]>(resolve => this.database.all<Apps.Result>(
      'SELECT apps.package_name, apps.title, apps.description, apps.author, apps.use_template FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uid = ?;',
      [uid || ''],
      (error, rows) => error ? resolve([]) : resolve(rows.map(result => ({
        package_name: result.package_name,
        title: result.title,
        description: result.description,
        author: result.author,
        extensions: (result.extensions || '').split('|'),
        useTemplate: result.use_template === 1
      })))
    ))
    const appList: LocalCloud.SessionData['apps'] = {}
    for (const app of apps) {
      const sessionApp: LocalCloud.SessionApp = {
        token: crypto.randomUUID(),
        ...app,
        secureSources: [],
        permissions: []
      }
      appList[app.package_name] = sessionApp
    }
    return appList
  }
}