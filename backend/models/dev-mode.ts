import type { Database } from 'sqlite3'
import { v4 } from 'uuid'
import esbuild from 'esbuild'
import * as API_LIST from 'libraries/classes/APIList'

declare const Library: PXIO.LibraryDecorator

export class DevModeModel {
  @Library('devMode') public devMode: DevMode.Class
  @Library('database') public database: Database
  public privateAPIList: string[] = []
  public dashAPIList: string[] = []
  public publicAPIList: string[] = []
  private allAPIList: string[] = []
  constructor() {
    const entries = Object.entries(API_LIST)
    for (const [_, value] of entries) {
      const subEntries = Object.entries(value)
      for (const [_, value2] of subEntries) {
        if (typeof value2 === 'object') {
          if (value2.freeForDashboard) {
            this.dashAPIList.push(value2.name)
            this.allAPIList.push(value2.name)
          }
          if (value2.public) {
            this.publicAPIList.push(value2.name)
            this.allAPIList.push(value2.name)
          }
        } else {
          this.privateAPIList.push(value2)
          this.allAPIList.push(value2)
        }
      }
    }
  }
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
  public transformJS(token: string, key: string, apis: string[]): string {
    const inject = apis.map(api => this.devMode.resolve(['apis', `${api}.ts`]))
    const modules = {}
    for (const api of this.allAPIList) {
      modules[`$${api}`] = apis.includes(api) ? 'true' : 'false'
    }
    const content = esbuild.buildSync({
      entryPoints: [this.devMode.resolve(['main'])],
      bundle: true,
      platform: 'browser',
      define: {
        TOKEN: `"${token}"`,
        KEY: `"${key}"`,
        IS_DEV: this.devMode.config.isDevMode ? 'true' : 'false',
        ...modules
      },
      /* minify: !this.devMode.config.isDevMode, */
      minify: false,
      format: 'esm',
      write: false,
      inject,
      treeShaking: true
    })
    return content.outputFiles[0].text
  }
}