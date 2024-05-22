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
  private parse = (results: Apps.Result[]): Apps.App[] => results.map(result => ({
    package_name: result.package_name,
    title: result.title,
    description: result.description,
    author: result.author,
    extensions: (result.extensions || '').split('|'),
    useStorage: result.use_storage === 1 ? true : false,
    useTemplate: (result as any).use_template === 1 ? true : false
  }))
  public getAppsByUID(uid: Users.User['uid']): Promise<Apps.App[]> {
    return new Promise(resolve => this.database.all<Apps.Result>(
      'SELECT apps.package_name, apps.title, apps.description, apps.author, apps.use_storage, apps.use_template FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uid = ?;',
      [uid],
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
  public async install(package_name: string, data: Buffer, update: boolean = false): Promise<InstallError | true> {
    if (update) {
      await this.uninstall(package_name, true)
    }
    const tempDir = path.join(this.paths.apps, 'temp', v4())
    fs.mkdirSync(tempDir, { recursive: true })
    await unzipper.Open
      .buffer(data)
      .then(d => d.extract({ path: tempDir }))
    let useTemplate = false
    let template = '{% layout "layout.liquid" %}'
    const headPath = path.join(tempDir, 'head.html')
    if (fs.existsSync(headPath)) {
      useTemplate = true
      const headContent = fs.readFileSync(headPath, 'utf8')
      template += `{% block head %}${headContent}{% endblock %}`
    }
    const bodyPath = path.join(tempDir, 'body.html')
    if (fs.existsSync(bodyPath)) {
      useTemplate = true
      const bodyContent = fs.readFileSync(bodyPath, 'utf8')
      template += `{% block body %}${bodyContent}{% endblock %}`
    }
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
    const { title, description = 'Sin descripción', author, permissions: permissionList = {}, sources = {}, extensions = [], 'use-storage': useStorage = false } = manifestContent as any
    const permissions: Apps.New['permissions'] = Object.keys(permissionList).map(api => ({
      api,
      justification: permissionList[api]
    }))
    await new Promise(resolve => this.database.run(
      'INSERT INTO apps (package_name, title, description, author, extensions, use_storage, use_template) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [package_name, title, description, author, extensions.join('|'), useStorage ? 1 : 0, useTemplate ? 1 : 0],
      resolve
    ))
    for (const permission of permissions) {
      await new Promise(resolve => this.database.run(
        'INSERT INTO permissions (package_name, api, justification, active) VALUES (?, ?, ?, ?)',
        [package_name, permission.api, permission.justification || 'Sin justificación.', true],
        resolve
      ))
    }
    for (const [name, srcs] of Object.entries(sources)) {
      if (['image', 'media', 'object', 'script', 'style', 'worker', 'font', 'connect'].includes(name)) {
        for (const src of srcs as any[]) {
          await new Promise(resolve => this.database.run(
            'INSERT INTO secure_sources (package_name, type, source, justification, active) VALUES (?, ?, ?, ?, ?)',
            [package_name, name, src.source, src.justification || 'Sin justificación.', true],
            resolve
          ))
        }
      }
    }
    fs.cpSync(path.join(tempDir, 'code'), this.paths.getApp(package_name), { recursive: true })
    const storagePath = this.paths.getAppGlobalStorage(package_name)
    if (useStorage) {
      fs.mkdirSync(storagePath, { recursive: true })
    } else {
      if (fs.existsSync(storagePath)) {
        fs.rmSync(storagePath, { recursive: true })
      }
    }
    const templatePath = path.join(this.paths.appsTemplates, `${package_name.replace(/\./g, '-')}.liquid`)
    if (useTemplate) {
      if (!fs.existsSync(this.paths.appsTemplates)) {
        fs.mkdirSync(this.paths.appsTemplates, { recursive: true })
      }
      fs.writeFileSync(templatePath, template, 'utf8')
    } else {
      if (fs.existsSync(templatePath)) {
        fs.rmSync(templatePath, { recursive: true })
      }
    }
    fs.rmSync(tempDir, { recursive: true, force: true })
    return true
  }
  public async uninstall(package_name: string, skipAssignments: boolean = false): Promise<void> {
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
    if (!skipAssignments) {
      await new Promise(resolve => this.database.run(
        'DELETE FROM users_to_apps WHERE package_name = ?',
        [package_name],
        resolve
      ))
    }
    await new Promise(resolve => this.database.run(
      'DELETE FROM apps WHERE package_name = ?',
      [package_name],
      resolve
    ))
    if (!skipAssignments) {
      const appStorage = this.paths.getAppStorage(package_name)
      if (fs.existsSync(appStorage)) {
        fs.rmSync(appStorage, { force: true, recursive: true })
      }
    }
    const appPath = this.paths.getApp(package_name)
    fs.rmSync(appPath, { recursive: true, force: true })
    const templatePath = path.join(this.paths.appsTemplates, `${package_name.replace(/\./g, '-')}.liquid`)
    if (fs.existsSync(templatePath)) {
      fs.rmSync(templatePath, { recursive: true, force: true })
    }
  }
}

interface InstallError {
  code: string
  message: string
}