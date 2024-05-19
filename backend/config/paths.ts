import path from 'node:path'

declare const isRelease: boolean

let system: string
if (isRelease) {
  system = path.resolve('/', 'var', 'lc')
} else {
  system = path.resolve('.', 'lc')
}

export const paths: Paths.Config = {
  samba: '/etc/samba/smb.conf',
  shadow: '/etc/shadow',
  passwd: '/etc/passwd',
  groups: '/etc/group',
  system: {
    path: system,
    apps: path.join(system, 'apps'),
    storages: path.join(system, 'storages'),
    database: path.join(system, 'system.db')
  },
  users: {
    shared: path.join('/', 'shared'),
    path: path.join('/', 'home'),
    recycleBin: path.join('/', 'recycler-bin')
  }
}