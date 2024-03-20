import fs from 'node:fs'
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
  moduleEmitters.emit('Paths:ready')
  return paths
}