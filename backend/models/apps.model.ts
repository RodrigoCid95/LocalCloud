import { Lib } from 'phoenix-js/core'
import { ISQLite } from 'types/SQLite'
import { AppsManagerClass, Manifest, ManifestResult } from 'types/AppsManager'
import { IFileSystem } from 'types/FileSystem'
import fs from 'fs'
import path from 'path'
import { v4 } from 'uuid'
import unzipper from 'unzipper'

export class AppsModel implements AppsManagerClass {
  @Lib('sqlite') private sqlite: ISQLite
  @Lib('fileSystem') private fileSystem: IFileSystem
  public usersPath: string
  public systemAppsPath: string
  constructor() {
    this.usersPath = path.join(this.fileSystem.baseDir, 'users')
    if (!fs.existsSync(this.usersPath)) {
      fs.mkdirSync(this.usersPath, { recursive: true })
    }
  }
  public async install(uuid: string, packageName: string, data: Buffer): Promise<void> {
    const tempName = `${v4()}.zip`
    const tempPath = path.join(this.usersPath, uuid, 'temp', tempName)
    const appPath = path.join(this.usersPath, uuid, 'apps', packageName)
    const userDBPath = path.join(this.usersPath, uuid, 'data.db')
    const result = await this.sqlite.get(userDBPath, 'apps', { packageName })
    const revert = () => {
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { recursive: true, force: true })
      }
      if (fs.existsSync(appPath)) {
        fs.rmSync(appPath, { recursive: true, force: true })
      }
    }
    if (result === null) {
      try {
        fs.writeFileSync(tempPath, data)
        if (fs.existsSync(appPath)) {
          fs.rmSync(appPath, { recursive: true, force: true })
        }
        fs.mkdirSync(appPath, { recursive: true })
        await unzipper.Open.file(tempPath).then(d => d.extract({ path: appPath, concurrency: 5 }))
        fs.rmSync(tempPath, { recursive: true, force: true })
        const manifestPath = path.join(appPath, 'manifest.json')
        const manifestData = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }))
        fs.rmSync(manifestPath, { force: true })
        const { title, description, author, icon, services = {}, type, tag, appSystem } = manifestData
        if (!title || !type) {
          revert()
          throw new Error('Error de instalación')
        }
        const result = await this.sqlite.insert(
          userDBPath,
          'apps',
          {
            packageName,
            title,
            description: description || '',
            author: author ? JSON.stringify(author) : '',
            icon,
            services: JSON.stringify(services),
            type,
            // tag,
            // appSystem: appSystem ? 1 : 0
          })
        console.log(result)
      } catch (error) {
        revert()
        throw new Error('Error de instalación')
      }
    } else {
      throw new Error(`La app ${packageName} ya está instalada!`)
    }
  }
  public getManifest(packageName: string, uuid: string): Promise<Manifest | null> {
    return this.findManifest(path.join(this.usersPath, uuid, 'data.db'), packageName)
  }
  public getSystemManifest(packageName: string): Promise<Manifest | null> {
    return this.findManifest(path.join(this.fileSystem.baseDir, 'data.db'), packageName)
  }
  private async findManifest(dbPath: string, packageName: string): Promise<Manifest | null> {
    const result = await this.sqlite.get<ManifestResult>(dbPath, 'apps', { packageName })
    let manifest: Manifest | null = null
    if (result) {
      const { packageName, title, description, author, icon, services, type, tag } = result
      manifest = { packageName, title, description, author: author ? JSON.parse(author) : null, icon, services: services ? JSON.parse(services) : null, type, tag }
    }
    return manifest
  }
  public async getManifests(uuid: string): Promise<Manifest[]> {
    const dbPath = path.join(this.usersPath, uuid, 'data.db')
    const manifestResults: ManifestResult[] = await this.sqlite.getAll(dbPath, 'apps')
    const results: Manifest[] = manifestResults.map(
      ({ packageName, title, description, author, icon, services, type, tag }) =>
        ({ packageName, title, description, author: author ? JSON.parse(author) : null, icon, services: services ? JSON.parse(services) : null, type, tag })
    )
    return results
  }
  public async uninstall(uuid: string, packageName: string): Promise<void> {
    const appPath = path.join(this.usersPath, uuid, 'apps', packageName)
    const userDBPath = path.join(this.usersPath, uuid, 'data.db')
    const result = await this.sqlite.get(userDBPath, 'apps', { packageName })
    if (result !== null) {
      fs.rmSync(appPath, { recursive: true, force: true })
      await this.sqlite.delete(userDBPath, 'apps', { packageName })
    } else {
      throw new Error(`La app ${packageName} no está instalada!`)
    }
  }
  public resolveAppDir(packageName: string, userUUID: string): string {
    return path.join(this.usersPath, userUUID, 'apps', packageName)
  }
}