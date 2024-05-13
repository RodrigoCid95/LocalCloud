import fs from 'node:fs'
import path from 'node:path'
import child from 'node:child_process'

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
  public lsUserDirectory(name: string, path: string[]): boolean | FileSystem.ItemInfo[] | FileSystem.ItemInfo {
    const userPath = this.paths.resolveUserPath({ segments: path, name })
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
  public resolveUserFile(name: string, pathFile: string[]): string | boolean {
    const result = this.paths.resolveUserPath({ name, segments: pathFile })
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
    child.execSync(`chown lc ${filePath}`)
  }
  public writeToUser(name: string, segments: string[], data: Buffer) {
    const filePath = this.paths.resolveUserPath({ name, segments, verify: false }) as string
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' })
    child.execSync(`chown ${name} ${filePath}`)
  }
  public mkdirToShared(segments: string[]) {
    const dirPath = this.paths.resolveSharedPath({ segments, verify: false }) as string
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      child.execSync(`chown -R lc ${dirPath}`)
    }
  }
  public mkdirToUser(name: string, segments: string[]) {
    const dirPath = this.paths.resolveUserPath({ name, segments, verify: false }) as string
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      child.execSync(`chown ${name} ${dirPath}`)
    }
  }
  public rmToShared(segments: string[]) {
    const dirPath = this.paths.resolveSharedPath({ segments })
    if (typeof dirPath === 'string') {
      fs.rmSync(dirPath, { force: true, recursive: true })
    }
  }
  public rmToUser(name: string, segments: string[]) {
    const dirPath = this.paths.resolveUserPath({ name, segments })
    if (typeof dirPath === 'string') {
      fs.rmSync(dirPath, { force: true, recursive: true })
    }
  }
  public resolvePath(name: string, pth: string[], verify: boolean): string | boolean {
    const segments = [...pth]
    const base = segments.shift()
    let result: string | boolean = ''
    if (base === 'shared') {
      result = this.paths.resolveSharedPath({ segments, verify })
    } else {
      result = this.paths.resolveUserPath({ name, segments, verify })
    }
    return result
  }
  public copy(name: string, origin: string[], dest: string[], move: boolean = false) {
    const originPath = this.resolvePath(name, origin, true)
    if (typeof originPath === 'boolean') {
      return
    }
    const newDest = [...dest, origin[origin.length - 1]]
    let destPath = this.resolvePath(name, newDest, false) as string
    const statOrigin = fs.statSync(originPath)
    const isFile = statOrigin.isFile()
    let dp = ''
    if (isFile) {
      while (fs.existsSync(destPath)) {
        const segments = destPath.split('.')
        const ext = segments.pop()
        destPath = `${segments.join('.')}-copia.${ext}`
      }
      fs.copyFileSync(originPath, destPath)
      dp = destPath
    } else {
      while (fs.existsSync(destPath)) {
        destPath += '-copia'
      }
      fs.cpSync(originPath, destPath, { recursive: true })
      dp = destPath
    }
    if (dp.split(this.paths.shared).length === 1) {
      child.execSync(`chown ${name} ${dp}`)
    } else {
      child.execSync(`chown lc ${dp}`)
    }
    if (move) {
      fs.rmSync(originPath, { recursive: true, force: true })
    }
  }
  public rename(uuid: string, path: string[], newName: string) {
    const oldPath = this.resolvePath(uuid, path, true)
    if (typeof oldPath === 'boolean') {
      return
    }
    const segments = [...path]
    segments.pop()
    let newPath = this.resolvePath(uuid, [...segments, newName], true)
    if (typeof newPath === 'string') {
      return
    }
    newPath = this.resolvePath(uuid, [...segments, newName], false) as string
    fs.renameSync(oldPath, newPath)
  }
}