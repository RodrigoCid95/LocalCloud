import type { Collection, Db } from 'mongodb'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import unzipper from 'unzipper'

declare const Library: PXIO.LibraryDecorator

export class AppsModel {
  @Library('mongo') private db: Db
  @Library('paths') public paths: Paths.Class
  private get appsCollection(): Collection<Apps.App> {
    return this.db.collection<Apps.App>('apps')
  }
  private get u2aCollection() {
    return this.db.collection('users_to_apps')
  }
  private isJSON = (text: string): boolean => /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
  public async getAppsByUID(uid: Users.User['uid']): Promise<Apps.App[]> {
    const appList: Apps.App[] = []
    const assignments = await this.u2aCollection.find({ uid }).toArray()
    for (const assignment of assignments) {
      const app = await this.appsCollection.findOne({ package_name: assignment.package_name })
      if (app) {
        appList.push({
          package_name: app.package_name,
          title: app.title,
          description: app.description,
          author: app.author,
          useTemplate: app.useTemplate
        })
      }
    }
    return appList
  }
  public async getApps(): Promise<Apps.App[]> {
    const results = await this.appsCollection
      .find({})
      .toArray()
    return results.map(({ package_name, title, description, author, useTemplate }) => ({ package_name, title, description, author, useTemplate }))
  }
  public getAppByPackageName(package_name: string): Promise<Apps.App | null> {
    return this.appsCollection.findOne({ package_name })
  }
  public async install(package_name: string, data: Buffer, update: boolean = false): Promise<InstallError | true> {
    if (update) {
      await this.uninstall(package_name, true)
    }
    const tempDir = path.join(this.paths.apps, 'temp', crypto.randomUUID())
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
    await this.appsCollection.insertOne({
      package_name,
      title,
      description,
      author,
      extensions: extensions.join('|'),
      useStorage,
      useTemplate
    })
    for (const permission of permissions) {
      await this.db.collection('permissions').insertOne({
        package_name,
        api: permission.api,
        justification: permission.justification || 'Sin justificación.',
        active: true
      })
    }
    for (const [name, srcs] of Object.entries(sources)) {
      if (['image', 'media', 'object', 'script', 'style', 'worker', 'font', 'connect'].includes(name)) {
        for (const src of srcs as any[]) {
          await this.db.collection('secure_sources').insertOne({
            package_name,
            type: name,
            source: src.source,
            justification: src.justification || 'Sin justificación.',
            active: true
          })
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
    await this.db.collection('secure_sources').deleteMany({ package_name })
    await this.db.collection('permissions').deleteMany({ package_name })
    if (!skipAssignments) {
      await this.u2aCollection.deleteMany({ package_name })
    }
    await this.appsCollection.deleteMany({ package_name })
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