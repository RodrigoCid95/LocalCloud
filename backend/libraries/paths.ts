import type { PathsConfigProfile, PathsLib } from "interfaces/Paths"
import fs from 'node:fs'
import path from 'node:path'
import { InitLibrary } from "phoenix-js/core"

class Paths implements PathsLib {
  constructor(private paths: PathsConfigProfile) {
    const { system, users } = paths
    if (!fs.existsSync(system.path)) {
      fs.mkdirSync(system.path, { recursive: true })
    }
    if (!fs.existsSync(system.apps.path)) {
      fs.mkdirSync(system.apps.path, { recursive: true })
    }
    if (!fs.existsSync(users.path)) {
      fs.mkdirSync(users.path, { recursive: true })
    }
  }
  getSystem(): string {
    return this.paths.system.path
  }
  getSystemApps(): string {
    return this.paths.system.apps.path
  }
  getSystemApp(packagename: string): string {
    const appPath = this.paths.system.apps.app.path.replace(/:packagename/, packagename)
    if (!fs.existsSync(appPath)) {
      throw new Error(`La ruta ${appPath} no existe!`)
    }
    return appPath
  }
  getSystemAppPublic(packagename: string): string {
    const appPath = this.paths.system.apps.app.public.replace(/:packagename/, packagename)
    if (!fs.existsSync(appPath)) {
      throw new Error(`La ruta ${appPath} no existe!`)
    }
    return appPath
  }
  getSystemAppAsset(packagename: string, ...src: string[]): string {
    const appPath = this.paths.system.apps.app.public.replace(/:packagename/, packagename)
    const assetPath = path.resolve(appPath, ...src)
    if (!fs.existsSync(assetPath)) {
      throw new Error(`El recurso ${assetPath} no existe!`)
    }
    return assetPath
  }
  getSystemAppDatabases(packagename: string): string {
    const dbPath = this.paths.system.apps.app.databases.path.replace(/:packagename/, packagename)
    if (!fs.existsSync(dbPath)) {
      throw new Error(`La ruta ${dbPath} no existe!`)
    }
    return dbPath
  }
  getSystemAppDatabase(packagename: string, name: string): string {
    return this.paths.system.apps.app.databases.database.replace(/:packagename/, packagename).replace(/:name/, name)
  }
  getUsers(): string {
    return this.paths.users.path
  }
  getUser(uuid: string): string {
    const userPath = this.paths.users.user.path.replace(/:uuid/, uuid)
    if (!fs.existsSync(userPath)) {
      throw new Error(`La ruta ${userPath} no existe!`)
    }
    return userPath
  }
  createSystemAppBaseStore(packagename: string): void {
    const systemAppPath = this.paths.system.apps.app.path.replace(/:packagename/, packagename)
    if (fs.existsSync(systemAppPath)) {
      throw new Error(`El directorio ${systemAppPath} ya existe!`)
    }
    const systemAppPublicPath = this.paths.system.apps.app.public.replace(/:packagename/, packagename)
    const systemAppDatabasesPath = this.paths.system.apps.app.databases.path.replace(/:packagename/, packagename)
    fs.mkdirSync(systemAppPath, { recursive: true })
    fs.mkdirSync(systemAppPublicPath, { recursive: true })
    fs.mkdirSync(systemAppDatabasesPath, { recursive: true })
  }
  createUserBaseStore(uuid: string): void {
    const userPath = this.paths.users.user.path.replace(/:uuid/, uuid)
    if (fs.existsSync(userPath)) {
      throw new Error(`La ruta ${userPath} ya existe!`)
    }
    const userAppsPath = this.paths.users.user.path.replace(/:uuid/, uuid)
    fs.mkdirSync(userPath, { recursive: true })
    fs.mkdirSync(userAppsPath, { recursive: true })
  }
  removeSystemAppBaseStore(packagename: string): void {
    const appPath = this.paths.system.apps.app.path.replace(/:packagename/, packagename)
    if (!fs.existsSync(appPath)) {
      throw new Error(`La ruta ${appPath} no existe!`)
    }
    fs.rmSync(appPath, { recursive: true, force: true })
  }
  removeUserBaseStore(uuid: string): void {
    const appPath = this.paths.users.user.path.replace(/:uuid/, uuid)
    if (!fs.existsSync(appPath)) {
      throw new Error(`La ruta ${appPath} no existe!`)
    }
    fs.rmSync(appPath, { recursive: true, force: true })
  }
}

export const paths: InitLibrary<PathsConfigProfile, PathsLib> = profile => new Paths(profile)