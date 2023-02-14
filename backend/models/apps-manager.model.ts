import fs from 'fs'
import path from 'path'
import { AppsManagerClass } from 'types/AppsManager'
import { Lib } from 'bitis/core'

export class AppsManagerModel {
  @Lib('appsManager') private appsManager: AppsManagerClass
  public install(user: string, packageName: string, data: Buffer) {
    return this.appsManager.install(user, packageName, data)
  }
  public getManifest(packageName: string) {
    const manifestPath = path.resolve(__dirname, '..', 'manifests', `${packageName}.json`)
    if (!fs.existsSync(manifestPath)) {
      return
    }
    const content = fs.readFileSync(manifestPath, { encoding: 'utf8' })
    return JSON.parse(content)
  }
  public getManifests(packageNames: string[]) {
    const manifests: any = {}
    for (const packageName of packageNames) {
      manifests[packageName] = this.getManifest(packageName)
    }
    return manifests
  }
}