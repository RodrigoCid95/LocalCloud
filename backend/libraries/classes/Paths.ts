import fs from 'node:fs'
import path from 'node:path'

export class Paths implements Paths.Class {
  get samba(): string {
    return configs.get('paths').samba
  }
  get shadow(): string {
    return configs.get('paths').shadow
  }
  get passwd(): string {
    return configs.get('paths').passwd
  }
  get groups(): string {
    return configs.get('paths').group
  }
  get system() {
    return configs.get('paths').system.path
  }
  get database() {
    return configs.get('paths').system.database
  }
  get apps() {
    return configs.get('paths').system.apps
  }
  get appsTemplates() {
    return configs.get('paths').system.appsViews
  }
  get storages() {
    return configs.get('paths').system.storages
  }
  get users() {
    return configs.get('paths').users.path
  }
  get shared() {
    return configs.get('paths').users.shared
  }
  get recycleBin() {
    return configs.get('paths').users.recycleBin
  }
  constructor() {
    if (!fs.existsSync(this.system)) {
      fs.mkdirSync(this.system)
    }
    if (!fs.existsSync(this.apps)) {
      fs.mkdirSync(this.apps)
    }
  }
  getApp(packageName: string): string {
    return path.join(this.apps, packageName)
  }
  getAppStorage(packageName: string): string {
    return path.join(this.storages, packageName)
  }
  getAppGlobalStorage(packageName: string): string {
    return path.join(this.storages, packageName, '.global')
  }
  getAppGlobalStorageItem({ packageName, item }: Paths.GetAppGlobalStorageItemOptions): string {
    return path.join(this.storages, packageName, '.global', `${item}.json`)
  }
  getAppUserStorage({ packageName, user }: Paths.GetAppUserStorageOptions): string {
    return path.join(this.storages, packageName, user)
  }
  getAppUserStorageItem({ packageName, user, item }: Paths.GetAppUserStorageItemOptions): string {
    return path.join(this.storages, packageName, user, `${item}.json`)
  }
  getUser(name: string): string {
    return path.join(configs.get('paths').users.path, name)
  }
  getRecycleBin(name: string): string {
    return path.join(this.recycleBin, name)
  }
  getRecycleBinItem(name: string, id: string): string {
    return path.join(this.recycleBin, name, id)
  }
  private resolve(segments: string[], verify = true): string | boolean {
    const pathSegments = segments.filter(segment => segment !== '..')
    const pathShared = path.join(...pathSegments)
    if (verify) {
      if (fs.existsSync(pathShared)) {
        return pathShared
      }
      return false
    }
    return pathShared
  }
  resolveSharedPath({ segments, verify = true }: Paths.ResolveSharedPathArgs): string | boolean {
    return this.resolve([this.shared, ...segments], verify)
  }
  resolveUserPath({ name, segments, verify = true }: Paths.ResolveUsersPathArgs): string | boolean {
    return this.resolve([this.getUser(name), ...segments], verify)
  }
}