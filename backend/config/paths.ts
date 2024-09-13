import path from 'node:path'
import fs from 'node:fs'

const system = path.resolve(process.cwd(), 'lc')
let etc = process.env.ETC || path.resolve('/', 'etc')
const homePath = process.env.HOME || path.resolve('/', 'home')
const shared = process.env.SHARED || path.join('/', 'shared')
const recycleBin = process.env.RECYCLE_BIN || path.join('/', 'recycler-bin')
if (!fs.existsSync(etc)) {
  fs.mkdirSync(etc)
}
if (!fs.existsSync(shared)) {
  fs.mkdirSync(shared)
}
if (!fs.existsSync(recycleBin)) {
  fs.mkdirSync(recycleBin)
}
const samba = path.join(etc, 'samba', 'smb.conf')
const shadow = path.join(etc, 'shadow')
const passwd = path.join(etc, 'passwd')
const groups = path.join(etc, 'group')

export const paths: Paths.Config = {
  samba,
  shadow,
  passwd,
  group: groups,
  system: {
    path: system,
    apps: path.join(system, 'apps'),
    appsViews: path.join(system, 'client', 'views', 'apps'),
    storages: path.join(system, 'storages'),
    database: path.join(system, 'system.db'),
    clientPublic: path.resolve(system, 'client', 'public'),
    clientViews: path.resolve(system, 'client', 'views')
  },
  users: {
    shared,
    path: homePath,
    recycleBin
  }
}