import fs from 'node:fs'
import path from 'node:path'

export class PermissionsModel {
  private appsPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'apps')

  private readManifest(packageName: Apps.App['package_name']): any | undefined {
    const manifestPath = path.join(this.appsPath, packageName, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      return
    }
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)
    return manifest
  }

  public get(packageName: Apps.App['package_name']): Permissions.Permission[] {
    const results: Permissions.Permission[] = []
    const manifest = this.readManifest(packageName)
    if (!manifest) {
      return []
    }
    const { permissions = {} } = manifest
    const entries = Object.entries<any>(permissions)
    for (const [name, { description, enable }] of entries) {
      results.push({ name, description, enable })
    }
    return results
  }

  public put(packageName: Apps.App['package_name'], id: Permissions.Permission['name'], value: boolean): void {
    const manifest = this.readManifest(packageName)
    if (!manifest) {
      return
    }
    manifest['permissions'][id].enable = value
    const manifestContent = JSON.stringify(manifest)
    fs.writeFileSync(path.join(this.appsPath, packageName, 'manifest.json'), manifestContent, 'utf8')
  }
}