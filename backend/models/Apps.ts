import fs from 'node:fs'
import path from 'node:path'
import unzipper from 'unzipper'

export class AppsModel {
  private appsPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'apps')
  private appsAssignmentsPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'apps', 'assignments')
  private templatesPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'views', 'apps')
  public appsTempPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'temp')
  private storageDir: string = path.resolve('/', 'usr', 'share', 'local-cloud', 'storages')
  private globalStorageDir: string = path.join(this.storageDir, 'global')
  private usersStorageDir: string = path.join(this.storageDir, 'users')

  constructor() {
    if (!fs.existsSync(this.appsPath)) {
      fs.mkdirSync(this.appsPath, { recursive: true })
    }
    if (!fs.existsSync(this.appsTempPath)) {
      fs.mkdirSync(this.appsTempPath, { recursive: true })
    }
  }

  private readAssignments(): Assignments {
    if (!fs.existsSync(this.appsAssignmentsPath)) {
      return {}
    }
    const assignmentsContent = fs.readFileSync(this.appsAssignmentsPath, 'utf8')
    const assignments = JSON.parse(assignmentsContent)
    return assignments
  }

  private readManifest(packageName: Apps.App['package_name']): any | undefined {
    const manifestPath = path.join(this.appsPath, packageName, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      return
    }
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)
    return manifest
  }

  public get(): Apps.App[] {
    const packageNames = fs
      .readdirSync(this.appsPath)
      .filter(pn => pn !== 'assignments')
    const results: Apps.App[] = []
    for (const packageName of packageNames) {
      const manifest = this.readManifest(packageName)
      if (manifest) {
        const app: Apps.App = {
          package_name: packageName,
          title: manifest.title || '',
          description: manifest.description || '',
          author: manifest.author || '',
          extensions: manifest.extensions || []
        }
        results.push(app)
      }
    }
    return results
  }

  public getByPackageName(packageName: Apps.App['package_name']): Apps.App | undefined {
    const manifest = this.readManifest(packageName)
    if (!manifest) {
      return
    }
    return {
      package_name: packageName,
      title: manifest.title || '',
      description: manifest.description || '',
      author: manifest.author || '',
      extensions: manifest.extensions || []
    }
  }

  public getByUid(uid: Users.User['uid']): Apps.App[] {
    const assignments = this.readAssignments()
    const packageNames = assignments[uid.toString()] || []
    const results: Apps.App[] = []
    for (const packageName of packageNames) {
      const manifest = this.readManifest(packageName)
      const app: Apps.App = {
        package_name: packageName,
        title: manifest.title || '',
        description: manifest.description || '',
        author: manifest.author || '',
        extensions: manifest.extensions || []
      }
      results.push(app)
    }
    return results
  }

  public async install(packageName: Apps.App['package_name'], fileName: string, update: boolean = false): Promise<InstallResult> {
    if (update) {
      this.uninstall(packageName, true)
    }
    const appPath = path.join(this.appsPath, packageName)
    fs.mkdirSync(appPath, { recursive: true })
    await unzipper.Open
      .file(fileName)
      .then(d => d.extract({ path: appPath }))
    const templateName = `${packageName.split('.').join('-')}.liquid`
    const templatePath = path.join(appPath, templateName)
    const viewPath = path.join(this.templatesPath, templateName)
    const rollback = () => {
      if (fs.existsSync(viewPath)) {
        fs.rmSync(viewPath, { recursive: true, force: true })
      }
      fs.rmSync(appPath, { recursive: true, force: true })
    }
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, viewPath)
      fs.rmSync(templatePath, { force: true })
    }
    const manifestPath = path.join(appPath, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      rollback()
      return 'manifest-not-exist'
    }
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    if (!isJSON(manifestContent)) {
      rollback()
      return 'manifest-invalid'
    }
    const manifest = JSON.parse(manifestContent)
    if (!manifest['title']) {
      rollback()
      return 'manifest-title-required'
    }
    if (!manifest['author']) {
      rollback()
      return 'manifest-author-required'
    }
    if (manifest['permissions']) {
      const permissions = {}
      const entries = Object.entries(manifest['permissions'])
      for (const [permission, description] of entries) {
        permission[permission] = { description, enable: true }
      }
      manifest['permissions'] = permissions
    }
    return true
  }

  public uninstall(packageName: Apps.App['package_name'], conserveData = false): void {
    const app = this.get().find(a => a.package_name === packageName)
    if (!app) {
      return
    }
    const appPath = path.join(this.appsPath, packageName)
    const templateName = `${packageName.split('.').join('-')}.liquid`
    const viewPath = path.join(this.templatesPath, templateName)
    fs.rmSync(appPath, { recursive: true, force: true })
    if (fs.existsSync(viewPath)) {
      fs.rmSync(viewPath, { recursive: true, force: true })
    }
    if (!conserveData) {
      const globalStorage = path.join(this.globalStorageDir, `${packageName}.json`)
      if (fs.existsSync(globalStorage)) {
        fs.rmSync(globalStorage)
      }
      const users = fs.readdirSync(this.usersStorageDir)
      for (const user of users) {
        const userStorage = path.join(this.usersStorageDir, user, `${packageName}.json`)
        if (fs.existsSync(userStorage)) {
          fs.rmSync(userStorage)
        }
      }
    }
  }

  public resolveAsset(packageName: Apps.App['package_name'], ...assetPath: string[]): string {
    const assetsPath = path.join(this.appsPath, packageName, 'code')
    return path.join(assetsPath, ...assetPath)
  }
}

type InstallResult = 'manifest-not-exist' | 'manifest-invalid' | 'manifest-title-required' | 'manifest-author-required' | true

interface Assignments {
  [x: Users.User['uid']]: string[]
}