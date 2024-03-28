import fs from 'node:fs'
import path from 'node:path'

declare const configs: PXIO.Configs
declare const moduleEmitters: PXIO.Emitters

class Paths implements Paths.Class {
  get system() {
    return this.config.system.path
  }
  get database() {
    return this.config.system.database
  }
  get apps() {
    return this.config.system.apps.path
  }
  get users() {
    return this.config.users.path
  }
  get shared() {
    return this.config.users.shared
  }
  constructor(private config: Paths.Config) { }
  getApp(packagename: string): string {
    return this.config.system.apps.app.path.replace(/:packagename/, packagename)
  }
  getAppPublic(packagename: string): string {
    return this.config.system.apps.app.public.replace(/:packagename/, packagename)
  }
  getAppDatabases(packagename: string): string {
    return this.config.system.apps.app.databases.path.replace(/:packagename/, packagename)
  }
  getAppDatabase(packagename: string, name: string): string {
    return this.config.system.apps.app.databases.database.replace(/:packagename/, packagename).replace(/:name/, name)
  }
  getUser(uuid: string): string {
    return this.config.users.user.path.replace(/:uuid/, uuid)
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
  resolveUserPath({ uuid, segments, verify = true }: Paths.ResolveUsersPathArgs): string | boolean {
    return this.resolve([this.getUser(uuid), ...segments], verify)
  }
}

export const paths = () => {
  const paths = new Paths(configs.get('paths'))
  if (!fs.existsSync(paths.system)) {
    fs.mkdirSync(paths.system)
  }
  if (!fs.existsSync(paths.apps)) {
    fs.mkdirSync(paths.apps)
  }
  if (!fs.existsSync(paths.users)) {
    fs.mkdirSync(paths.users)
  }
  if (!fs.existsSync(paths.shared)) {
    fs.mkdirSync(paths.shared)
  }
  moduleEmitters.emit('Paths:ready')
  return paths
}