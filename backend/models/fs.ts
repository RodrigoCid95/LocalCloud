import fs from 'node:fs'
import path from 'node:path'

declare const Library: PXIO.LibraryDecorator

export class FileSystemModel {
  @Library('paths') private paths: Paths.Class
  public resolveFileOrDirectory(result: string | boolean): boolean | FileSystem.ItemInfo[] | FileSystem.ItemInfo {
    if (typeof result === 'boolean') {
      return false
    }
    const stat = fs.statSync(result)
    if (stat.isDirectory()) {
      const items = fs.readdirSync(result)
      return items.map(item => {
        const stat = fs.statSync(path.join(result, item))
        return {
          name: item,
          size: stat.size,
          lastModification: stat.mtime,
          creationDate: stat.birthtime,
          isFile: !stat.isDirectory()
        }
      })
    }
    return {
      name: path.basename(result),
      size: stat.size,
      lastModification: stat.mtime,
      creationDate: stat.birthtime,
      isFile: !stat.isDirectory()
    }
  }
  public lsSharedDirectory(path: string[]): boolean | FileSystem.ItemInfo[] | FileSystem.ItemInfo {
    const sharedPath = this.paths.resolveSharedPath({ segments: path })
    return this.resolveFileOrDirectory(sharedPath)
  }
  public lsUserDirectory(uuid: string, path: string[]): boolean | FileSystem.ItemInfo[] | FileSystem.ItemInfo {
    const userPath = this.paths.resolveUserPath({ segments: path, uuid })
    return this.resolveFileOrDirectory(userPath)
  }
  public resolveSharedFile(pathFile: string[]): string | boolean {
    const result = this.paths.resolveSharedPath({ segments: pathFile })
    if (typeof result === 'boolean') {
      return false
    }
    const stat = fs.statSync(result)
    if (stat.isDirectory()) {
      return false
    }
    return result
  }
  public resolveUserFile(uuid: string, pathFile: string[]): string | boolean {
    const result = this.paths.resolveUserPath({ uuid, segments: pathFile })
    if (typeof result === 'boolean') {
      return false
    }
    const stat = fs.statSync(result)
    if (stat.isDirectory()) {
      return false
    }
    return result
  }
  public writeToShared(segments: string[], data: Buffer) {
    const filePath = this.paths.resolveSharedPath({ segments, verify: false }) as string
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' })
  }
  public writeToUser(uuid: string, segments: string[], data: Buffer) {
    const filePath = this.paths.resolveUserPath({ uuid, segments, verify: false }) as string
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' })
  }
  public mkdirToShared(segments: string[]) {
    const dirPath = this.paths.resolveSharedPath({ segments, verify: false }) as string
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
  public mkdirToUser(uuid: string, segments: string[]) {
    const dirPath = this.paths.resolveUserPath({ uuid, segments, verify: false }) as string
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
  public rmToShared(segments: string[]) {
    const dirPath = this.paths.resolveSharedPath({ segments })
    if (typeof dirPath === 'string') {
      fs.rmSync(dirPath, { force: true, recursive: true })
    }
  }
  public rmToUser(uuid: string, segments: string[]) {
    const dirPath = this.paths.resolveUserPath({ uuid, segments })
    if (typeof dirPath === 'string') {
      fs.rmSync(dirPath, { force: true, recursive: true })
    }
  }
}