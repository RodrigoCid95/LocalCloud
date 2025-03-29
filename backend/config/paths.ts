import fs from 'node:fs'
import path from 'node:path'

export const verifyPath = (p: string, isDir: boolean) => {
  if (isDir) {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true })
    }
  } else {
    if (!fs.existsSync(p)) {
      const baseDir = path.dirname(p)
      verifyPath(baseDir, true)
      fs.writeFileSync(p, '', 'utf-8')
    }
  }
}

export const getPaths = (CONFIG: any): Paths => {
  const srcPath = CONFIG.server.connector
  const samba = path.resolve(CONFIG.system.samba)
  const shadow = path.resolve(CONFIG.system.shadow)
  const passwd = path.resolve(CONFIG.system.passwd)
  const group = path.resolve(CONFIG.system.group)
  const apps = path.resolve(CONFIG.server.apps)
  const views = path.resolve(CONFIG.server.views)
  const storages = path.resolve(CONFIG.server.storages)
  const shared = path.resolve(CONFIG.fs.shared)
  const home = path.resolve(CONFIG.fs.home)
  const recycleBin = path.resolve(CONFIG.fs['recycle bin'])
  const mainPath = path.join(srcPath, 'main.ts')
  const apiPath = path.join(srcPath, 'apis.ts')
  const appsViews = path.join(views, 'apps')
  const dataBase = path.resolve(CONFIG.server['data base'])
  verifyPath(samba, false)
  verifyPath(shadow, false)
  verifyPath(passwd, false)
  verifyPath(group, false)
  verifyPath(apps, true)
  verifyPath(views, true)
  verifyPath(storages, true)
  verifyPath(shared, true)
  verifyPath(home, true)
  verifyPath(recycleBin, true)
  verifyPath(mainPath, false)
  verifyPath(apiPath, false)
  verifyPath(appsViews, true)
  verifyPath(dataBase, false)
  return {
    samba,
    shadow,
    passwd,
    group,
    apps,
    views,
    storages,
    shared,
    home,
    recycleBin,
    mainPath,
    apiPath,
    appsViews,
    dataBase
  }
}

export interface Paths {
  samba: string
  shadow: string
  passwd: string
  group: string
  apps: string
  views: string
  storages: string
  shared: string
  home: string
  recycleBin: string
  mainPath: string
  apiPath: string
  appsViews: string
  dataBase: string
}