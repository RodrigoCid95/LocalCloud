import type { Database } from 'sqlite3'
import fs from 'node:fs'

declare const Library: PXIO.LibraryDecorator

export class AppsModel {
  @Library('database') private database: Database
  @Library('paths') public paths: Paths.Class
  public async register(app: Apps.New): Promise<void> {
    const [result] = await new Promise<Apps.Result[]>(resolve => this.database.all<Apps.Result>(
      'SELECT * FROM apps WHERE package_name = ?',
      [app.package_name],
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    if (!result) {
      await new Promise(resolve => this.database.run(
        'INSERT INTO apps (package_name, title, description, author) VALUES (?, ?, ?, ?);',
        [app.package_name, app.title, app.description, app.author],
        resolve
      ))
      if (app.permissions) {
        for (const permission of app.permissions) {
          await new Promise(resolve => this.database.run(
            'INSERT INTO permissions (package_name, api, justification, active) VALUES (?, ?, ?, ?)',
            [app.package_name, permission.api, permission.justification || 'Sin justificación.', true],
            resolve
          ))
        }
      }
      if (app.secureSources) {
        for (const source of app.secureSources) {
          await new Promise(resolve => this.database.run(
            'INSERT INTO secure_sources (package_name, type, source, justification, active) VALUES (?, ?, ?, ?, ?)',
            [app.package_name, source.type, source.source, source.justification || 'Sin justificación.', true],
            resolve
          ))
        }
      }
      const appPath = this.paths.getApp(app.package_name || '')
      fs.mkdirSync(appPath, { recursive: true })
      const appPublicPath = this.paths.getAppPublic(app.package_name || '')
      fs.mkdirSync(appPublicPath, { recursive: true })
      const appDatabasesPath = this.paths.getAppDatabases(app.package_name || '')
      fs.mkdirSync(appDatabasesPath, { recursive: true })
    }
  }
  private async parse(results: Apps.Result[]): Promise<Apps.App[]> {
    const apps: Apps.App[] = []
    for (const result of results) {
      const permissionsResults = await new Promise<Permissions.Result[]>(resolve => this.database.all<Permissions.Result>(
        'SELECT * FROM permissions WHERE package_name = ?',
        [result.package_name],
        (error, rows) => error ? resolve([]) : resolve(rows)
      ))
      const secureSourceResults = await new Promise<SecureSources.Result[]>(resolve => this.database.all<SecureSources.Result>(
        'SELECT * FROM secure_source WHERE package_name = ?',
        [result.package_name],
        (error, rows) => error ? resolve([]) : resolve(rows)
      ))
      const permissions: Permissions.Permission[] = permissionsResults.map(permission => ({
        id: permission.id_permission,
        api: permission.api,
        justification: permission.justification,
        active: (permission.active as unknown as number) === 1
      }))
      const secureSources: SecureSources.Source[] = secureSourceResults.map(secureSource => ({
        id: secureSource.id_source,
        type: secureSource.type,
        source: secureSource.source,
        justification: secureSource.justification,
        active: (secureSource.active as unknown as number) === 1
      }))
      apps.push({
        package_name: result.package_name,
        title: result.title,
        description: result.description,
        author: result.author,
        permissions,
        secureSources
      })
    }
    return apps
  }
  public getAppsByUUID(uuid: string): Promise<Apps.App[]> {
    return new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT apps.package_name, apps.title, apps.description, apps.author FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uuid = ?;',
      [uuid],
      (error, rows) => error ? resolve([]) : resolve(this.parse(rows))
    ))
  }
  public getApps(): Promise<Apps.App[]> {
    return new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT * FROM apps',
      (error, rows) => error ? resolve([]) : resolve(this.parse(rows))
    ))
  }
}