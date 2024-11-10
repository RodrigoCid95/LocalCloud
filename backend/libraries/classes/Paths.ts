import fs from 'node:fs'
import path from 'node:path'

export class Paths implements Paths.Class {
  get samba(): string {
    return getConfig('paths').samba
  }
  get shadow(): string {
    return getConfig('paths').shadow
  }
  get passwd(): string {
    return getConfig('paths').passwd
  }
  get groups(): string {
    return getConfig('paths').group
  }
  get database() {
    return getConfig('paths').system.database
  }
  get apps() {
    return getConfig('paths').system.apps
  }
  get appsTemplates() {
    return getConfig('paths').system.appsViews
  }
  get storages() {
    return getConfig('paths').system.storages
  }
  get users() {
    return getConfig('paths').users.path
  }
  get shared() {
    return getConfig('paths').users.shared
  }
  get recycleBin() {
    return getConfig('paths').users.recycleBin
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
    return path.join(getConfig('paths').users.path, name)
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