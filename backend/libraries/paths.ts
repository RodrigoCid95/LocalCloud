import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import ini from 'ini'

declare const configs: PXIO.Configs
declare const moduleEmitters: PXIO.Emitters

class Paths implements Paths.Class {
  get samba(): string {
    return this.config.samba
  }
  get shadow(): string {
    return this.config.shadow
  }
  get passwd(): string {
    return this.config.passwd
  }
  get groups(): string {
    return this.config.groups
  }
  get system() {
    return this.config.system.path
  }
  get database() {
    return this.config.system.database
  }
  get apps() {
    return this.config.system.apps
  }
  get storages() {
    return this.config.system.storages
  }
  get users() {
    return this.config.users.path
  }
  get shared() {
    return this.config.users.shared
  }
  get recycleBin() {
    return this.config.users.recycleBin
  }
  constructor(private config: Paths.Config) { }
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
    return path.join(this.config.users.path, name)
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

export const paths = async () => {
  const paths = new Paths(configs.get('paths'))
  if (!fs.existsSync(paths.system)) {
    fs.mkdirSync(paths.system)
  }
  if (!fs.existsSync(paths.apps)) {
    fs.mkdirSync(paths.apps)
  }
  const SMB_CONFIG = fs.readFileSync(paths.samba, 'utf8')
  const smbConfig = ini.parse(SMB_CONFIG)
  if (!smbConfig['Carpeta Compartida']) {
    smbConfig['Carpeta Compartida'] = {
      comment: 'Carpeta Compartida',
      path: paths.shared,
      browsable: 'yes',
      writable: 'yes',
      'guest ok': 'no',
      'valid users': '@lc'
    }
    const smbStrConfig = ini.stringify(smbConfig)
    fs.writeFileSync(paths.samba, smbStrConfig, 'utf8')
    await new Promise<void>(resolve => {
      const child_process = spawn('/etc/init.d/smbd', ['restart'])
      child_process.on('close', resolve)
      child_process.stdin.end()
    })
  }
  moduleEmitters.emit('Paths:ready')
  return paths
}