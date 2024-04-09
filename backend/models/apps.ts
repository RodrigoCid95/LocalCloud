import type { Database } from 'sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { v4 } from 'uuid'
import unzipper from 'unzipper'

declare const Library: PXIO.LibraryDecorator

export class AppsModel {
  @Library('database') private database: Database
  @Library('paths') public paths: Paths.Class
  private isJSON = (text: string): boolean => /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
  private async parse(results: Apps.Result[]): Promise<Apps.App[]> {
    const apps: Apps.App[] = []
    for (const result of results) {
      const permissionsResults = await new Promise<Permissions.Result[]>(resolve => this.database.all<Permissions.Result>(
        'SELECT * FROM permissions WHERE package_name = ?',
        [result.package_name],
        (error, rows) => error ? resolve([]) : resolve(rows)
      ))
      const secureSourceResults = await new Promise<SecureSources.Result[]>(resolve => this.database.all<SecureSources.Result>(
        'SELECT * FROM secure_sources WHERE package_name = ?',
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
  public getAppByPackageName(package_name: string): Promise<Apps.Result | null> {
    return new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT * FROM apps WHERE package_name = ?',
      [package_name],
      (error, rows) => error ? resolve(null) : resolve(rows[0])
    ))
  }
  public async install(package_name: string, data: Buffer): Promise<InstallError | true> {
    const tempDir = path.join(this.paths.apps, 'temp', v4())
    fs.mkdirSync(tempDir, { recursive: true })
    await unzipper.Open
      .buffer(data)
      .then(d => d.extract({ path: tempDir }))
    const appPath = this.paths.getApp(package_name)
    const manifestPath = path.join(tempDir, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
      return {
        code: 'manifest-not-exist',
        message: 'El paquete de instalación no cuenta con un archivo manifest.json'
      }
    }
    let manifestContent = fs.readFileSync(manifestPath, 'utf-8')
    if (this.isJSON(manifestContent)) {
      manifestContent = JSON.parse(manifestContent)
    } else {
      fs.rmSync(tempDir, { recursive: true, force: true })
      return {
        code: 'manifest-invalid',
        message: 'El archivo manifest.json no es válido.'
      }
    }
    const manifestKeys = Object.keys(manifestContent)
    if (!manifestKeys.includes('title')) {
      fs.rmSync(tempDir, { recursive: true, force: true })
      return {
        code: 'manifest-title-required',
        message: 'El archivo manifest.json no contiene un título.'
      }
    }
    if (!manifestKeys.includes('author')) {
      fs.rmSync(tempDir, { recursive: true, force: true })
      return {
        code: 'manifest-author-required',
        message: 'El archivo manifest.json no contiene un autor.'
      }
    }
    const { title, description = 'Sin descripción', author, permissions: permissionList = {}, sources = [], extensions = [] } = manifestContent as any
    const permissions: Apps.New['permissions'] = Object.keys(permissionList).map(api => ({
      api,
      justification: permissionList[api]
    }))
    await new Promise(resolve => this.database.run(
      'INSERT INTO apps (package_name, title, description, author, extensions) VALUES (?, ?, ?, ?, ?);',
      [package_name, title, description, author, extensions.join('|')],
      resolve
    ))
    for (const permission of permissions) {
      await new Promise(resolve => this.database.run(
        'INSERT INTO permissions (package_name, api, justification, active) VALUES (?, ?, ?, ?)',
        [package_name, permission.api, permission.justification || 'Sin justificación.', true],
        resolve
      ))
    }
    for (const source of sources) {
      await new Promise(resolve => this.database.run(
        'INSERT INTO secure_sources (package_name, type, source, justification, active) VALUES (?, ?, ?, ?, ?)',
        [package_name, source.type, source.source, source.justification || 'Sin justificación.', true],
        resolve
      ))
    }
    fs.cpSync(path.join(tempDir, 'code'), this.paths.getAppPublic(package_name), { recursive: true })
    fs.mkdirSync(this.paths.getAppDatabases(package_name), { recursive: true })
    fs.rmSync(tempDir, { recursive: true, force: true })
    return true
  }
  public async uninstall(package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'DELETE FROM secure_sources WHERE package_name = ?',
      [package_name],
      resolve
    ))
    await new Promise(resolve => this.database.run(
      'DELETE FROM permissions WHERE package_name = ?',
      [package_name],
      resolve
    ))
    await new Promise(resolve => this.database.run(
      'DELETE FROM users_to_apps WHERE package_name = ?',
      [package_name],
      resolve
    ))
    await new Promise(resolve => this.database.run(
      'DELETE FROM apps WHERE package_name = ?',
      [package_name],
      resolve
    ))
    const appPath = this.paths.getApp(package_name)
    fs.rmSync(appPath, { recursive: true, force: true })
  }
}

interface InstallError {
  code: string
  message: string
}