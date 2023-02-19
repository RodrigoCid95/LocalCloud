import fs from 'fs'
import path from 'path'
import { AppsManagerClass } from 'types/AppsManager'
import { Lib } from 'bitis/core'

export class AppsModel {
  @Lib('appsManager') private appsManager: AppsManagerClass
  public install(user: string, packageName: string, data: Buffer) {
    return this.appsManager.install(user, packageName, data)
  }
  public getManifest(packageName: string, uuid?: string) {
    if (uuid) {
      return this.appsManager.getManifest(packageName, uuid)
    } else {
      return this.appsManager.getSystemManifest(packageName)
    }
  }
  public getManifests(uuid: string) {
    return this.appsManager.getManifests(uuid)
  }
  public resolveAppDir(packageName: string, userUUID?: string): string {
    if (userUUID) {
      return path.join(this.appsManager.usersPath, userUUID, 'apps', packageName)
    } else {
      return path.join(this.appsManager.systemAppsPath, packageName)
    }
  }
  public uninstall(uuid: string, packageName: string) {
    return this.appsManager.uninstall(uuid, packageName)
  }
}