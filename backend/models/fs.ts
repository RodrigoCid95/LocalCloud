import fs from 'node:fs'
import path from 'node:path'

export class FileSystemModel {
  @Library('paths') private paths: Paths.Class
  @Library('process') private run: Process.Run
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
  public lsUserDirectory(name: Users.User['name'], path: string[]): boolean | FileSystem.ItemInfo[] | FileSystem.ItemInfo {
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
  public resolveUserFile(name: Users.User['name'], pathFile: string[]): string | boolean {
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
  public async writeToShared(segments: string[], data: Buffer): Promise<void> {
    const filePath = this.paths.resolveSharedPath({ segments, verify: false }) as string
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' })
    await this.run({
      title: 'Set Permission To Shared Item',
      command: 'chown',
      args: [':lc', filePath]
    })
  }
  public async writeToUser(name: Users.User['name'], segments: string[], data: Buffer): Promise<void> {
    const filePath = this.paths.resolveUserPath({ name, segments, verify: false }) as string
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' })
    await this.run({
      title: 'Set Owner To User',
      command: 'chown',
      args: [name, filePath]
    })
  }
  public async mkdirToShared(segments: string[]): Promise<void> {
    const dirPath = this.paths.resolveSharedPath({ segments, verify: false }) as string
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      await this.run({
        title: 'Set Permission To Shared Dir',
        command: 'chown',
        args: ['-R', 'lc', dirPath]
      })
    }
  }
  public async mkdirToUser(name: Users.User['name'], segments: string[]): Promise<void> {
    const dirPath = this.paths.resolveUserPath({ name, segments, verify: false }) as string
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      await this.run({
        title: 'Set Permission To User Dir',
        command: 'chown',
        args: [name, dirPath]
      })
    }
  }
  public rmToShared(segments: string[]) {
    const dirPath = this.paths.resolveSharedPath({ segments })
    if (typeof dirPath === 'string') {
      fs.rmSync(dirPath, { force: true, recursive: true })
    }
  }
  public rmToUser(name: Users.User['name'], segments: string[]) {
    const dirPath = this.paths.resolveUserPath({ name, segments })
    if (typeof dirPath === 'string') {
      fs.rmSync(dirPath, { force: true, recursive: true })
    }
  }
  public resolvePath(name: Users.User['name'], pth: string[], verify: boolean): string | boolean {
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
  public async copy(name: string, origin: string[], dest: string[], move: boolean = false): Promise<void> {
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
        destPath += ' - copia'
      }
      fs.cpSync(originPath, destPath, { recursive: true })
      dp = destPath
    }
    if (dp.split(this.paths.shared).length === 1) {
      await this.run({
        title: 'Set Permission To User Dir',
        command: 'chown',
        args: [name, dp]
      })
    } else {
      await this.run({
        title: 'Set Permission To Shared Item',
        command: 'chown',
        args: [':lc', dp]
      })
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