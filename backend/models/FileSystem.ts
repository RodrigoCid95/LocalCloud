import path from 'node:path'
import fs from 'node:fs'
import { quote } from 'shell-quote'

export class FileSystem {
  @Library('process') private run: Process.Run

  public homeDir: string = path.resolve('/', 'home')
  public sharedDir: string = path.resolve('/', 'shared')

  private async setPermission({ path: p, owner = ':lc', isDir = false }: SetPermissionArgs): Promise<void> {
    const args: string[] = []
    if (isDir) {
      args.push('-R')
    }
    args.push(owner)
    args.push(p)
    await this.run({
      title: `Set Permission [${owner} -> ${p}]`,
      command: 'chown',
      args
    })
  }

  public generateWriteStreamToFile(filePath: string): fs.WriteStream {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const stream = fs.createWriteStream(filePath)
    let owner: string | undefined = undefined
    if (!filePath.startsWith(this.sharedDir)) {
      owner = filePath.split('/')[2]
    }
    stream.on('finish', () => this.setPermission({ path: filePath, owner }))
    return stream
  }

  public async mkdir(dirPath: string, name?: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      await this.setPermission({ path: dirPath, isDir: true, owner: name })
    }
  }

  public getItem(filePath: string): FileSystem.ItemInfo | null {
    if (!fs.existsSync(filePath)) {
      return null
    }
    const stat = fs.statSync(filePath)
    return {
      name: path.basename(filePath),
      size: stat.size,
      lastModification: stat.mtime,
      creationDate: stat.birthtime,
      isFile: stat.isFile()
    }
  }

  public ls(dirPath: string): FileSystem.ItemInfo[] {
    if (!fs.existsSync(dirPath)) {
      return []
    }
    const stat = fs.statSync(dirPath)
    if (!stat.isDirectory()) {
      return []
    }
    const items = fs.readdirSync(dirPath)
    const results = items.map(item => {
      const stat = fs.statSync(path.join(dirPath, item))
      return {
        name: item,
        size: stat.size,
        lastModification: stat.mtime,
        creationDate: stat.birthtime,
        isFile: !stat.isDirectory()
      }
    })
    return results
  }

  public rm(itemPath: string): void {
    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { force: true, recursive: true })
    }
  }

  public async copy(origin: string, dest: string, move?: boolean): Promise<void> {
    if (!fs.existsSync(origin)) {
      return
    }
    const statOrigin = fs.statSync(origin)
    const isDir = statOrigin.isDirectory()
    while (fs.existsSync(dest)) {
      const ext = path.extname(dest)
      const pathWithoutExt = dest.slice(0, dest.length - ext.length)
      dest = `${pathWithoutExt}-copia${ext}`
    }
    if (isDir) {
      await this.run({
        title: `Copy ${origin} to ${dest}`,
        command: move ? 'mv' : 'cp',
        args: ['-R', quote([origin]), quote([dest])]
      })
    } else {
      await this.run({
        title: `Copy ${origin} to ${dest}`,
        command: move ? 'mv' : 'cp',
        args: [quote([origin]), quote([dest])]
      })
    }
    let user: string | null  = ''
    if (!dest.startsWith(this.sharedDir)) {
      const [_, h, u] = dest.split('/')
      if (h === 'recycle-bin') {
        user = null
      } else {
        user = u
      }
    }
    if (user !== null) {
      if (user) {
        await this.setPermission({ path: dest, owner: user, isDir })
      } else {
        await this.setPermission({ path: dest, isDir })
      }
    }
  }

  public rename(p: string, newName: string): void {
    const baseDir = path.dirname(p)
    const newPath = path.join(baseDir, newName)
    if (!fs.existsSync(p) && !fs.existsSync(newPath)) {
      fs.renameSync(p, newPath)
    }
  }
}

interface SetPermissionArgs {
  path: string
  owner?: string
  isDir?: boolean
}