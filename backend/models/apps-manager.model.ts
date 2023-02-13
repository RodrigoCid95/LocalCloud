import fs from 'fs'
import path from 'path'

export class AppsManagerModel {
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