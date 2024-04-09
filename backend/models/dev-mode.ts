import type { Database } from 'sqlite3'
import fs from 'node:fs'
import esbuild from 'esbuild'

declare const Library: PXIO.LibraryDecorator

export class DevModeModel {
  @Library('devMode') public isDevMode: DevMode.Config
  @Library('database') public database: Database
  public async getUser(): Promise<Users.User | undefined> {
    const [result] = await new Promise<Users.Result[]>(resolve => this.database.all<Users.Result>(
      'SELECT * FROM users WHERE uuid = ?',
      [this.isDevMode.uuid],
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    if (result) {
      const { uuid, full_name, user_name, photo, email, phone } = result
      return { uuid, full_name, user_name, photo, email, phone }
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
        secureSources,
        extensions: (result.extensions || '').split('|')
      })
    }
    return apps
  }
  public getApps(): Promise<Apps.App[]> {
    return new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT apps.package_name, apps.title, apps.description, apps.author FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uuid = ?;',
      [this.isDevMode.uuid],
      (error, rows) => error ? resolve([]) : resolve(this.parse(rows))
    ))
  }
  public transformJS(token: string, key: string): string {
    const content = esbuild.transformSync(fs.readFileSync(this.isDevMode.connectorPath, { encoding: 'utf-8' }), {
      platform: 'browser',
      loader: 'ts',
      define: {
        TOKEN: `"${token}"`,
        KEY: `"${key}"`,
        IS_DEV: this.isDevMode.isDevMode ? 'true' : 'false'
      },
      minify: !this.isDevMode.isDevMode
    })
    return content.code
  }
}