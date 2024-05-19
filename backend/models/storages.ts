import fs from 'node:fs'
import path, { dirname } from 'node:path'

declare const Library: PXIO.LibraryDecorator

export class StorageModel {
  @Library('paths') private paths: Paths.Class
  resolveTempGlobalItem(item: string) {
    const path = this.paths.getAppGlobalStorageItem({ packageName: "app-temp", item })
    return path
  }
  resolveTempUserItem(item: string) {
    const path = this.paths.getAppUserStorageItem({ item, packageName: "app-temp", user: "user-temp" })
    return path
  }
  resolveGlobalItem(packageName: string, item: string) {
    const path = this.paths.getAppGlobalStorageItem({ packageName, item })
    if (fs.existsSync(path)) {
      return path
    }
  }
  resolveUserItem(packageName: string, name: string, item: string) {
    const path = this.paths.getAppUserStorageItem({ packageName, user: name, item })
    if (fs.existsSync(path)) {
      return path
    }
  }
  loadStorage(path: string) {
    if (fs.existsSync(path)) {
      let contentStorage = fs.readFileSync(path, 'utf8') || '{}'
      contentStorage = JSON.parse(contentStorage)
      return contentStorage
    }
    return null
  }
  writeContent(pathStorage: string, content: any) {
    const dirName = path.dirname(pathStorage)
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true })
    }
    let contentStorage = 'null'
    if (content) {
      contentStorage = JSON.stringify(content)
    }
    fs.writeFileSync(pathStorage, contentStorage, 'utf8')
  }
}