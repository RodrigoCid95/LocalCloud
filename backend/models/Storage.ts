import path from 'node:path'
import fs from 'node:fs'

export class StorageModel {
  private storageDir: string = path.resolve('/', 'usr', 'share', 'local-cloud', 'storages')
  private globalStorageDir: string = path.join(this.storageDir, 'global')
  private usersStorageDir: string = path.join(this.storageDir, 'users')

  private resolveGlobalPath(packageName: string): string {
    return path.join(this.globalStorageDir, `${packageName}.json`)
  }

  public resolveUserPath(userName: string, packageName: string): string {
    return path.join(this.usersStorageDir, userName, `${packageName}.json`)
  }

  getGlobalData(packageName: string): any {
    const storagePath = this.resolveGlobalPath(packageName)
    if (!fs.existsSync(storagePath)) {
      return {}
    }
    const content = fs.readFileSync(storagePath, 'utf8') || '{}'
    const data = JSON.parse(content)
    return data
  }

  setGlobalData(packageName: string, data: any): void {
    const storagePath = this.resolveGlobalPath(packageName)
    const newData = JSON.stringify(data)
    fs.writeFileSync(storagePath, newData, 'utf8')
  }

  getUserData(packageName: string, user: Users.User['name']): any {
    const storagePath = this.resolveUserPath(user, packageName)
    if (!fs.existsSync(storagePath)) {
      return {}
    }
    const content = fs.readFileSync(storagePath, 'utf8') || '{}'
    const data = JSON.parse(content)
    return data
  }

  setUserData(packageName: string, user: Users.User['name'], data: any): void {
    const storagePath = this.resolveUserPath(user, packageName)
    const newData = JSON.stringify(data)
    const baseDir = path.dirname(storagePath)
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }
    fs.writeFileSync(storagePath, newData, 'utf8')
  }
}