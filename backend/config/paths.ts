import path from 'node:path'

declare const isRelease: boolean

let system: string
if (isRelease) {
  system = path.resolve('/', 'var', 'lc')
} else {
  system = path.resolve('.', 'lc')
}
const systemApps: string = path.join(system, 'apps')
const systemApp: string = path.join(system, 'apps', ':packagename')
const systemDatabases: string = path.join(systemApp, 'data')

export const paths: Paths.Config = {
  samba: '/etc/samba/smb.conf',
  shadow: '/etc/shadow',
  passwd: '/etc/passwd',
  groups: '/etc/group',
  system: {
    path: system,
    apps: {
      path: systemApps,
      app: {
        path: systemApp,
        public: path.join(systemApp, 'public'),
        databases: {
          path: systemDatabases,
          database: path.join(systemDatabases, ':name.db')
        }
      }
    },
    database: path.join(system, 'system.db')
  },
  users: {
    shared: path.join('/', 'shared'),
    path: path.join('/', 'home'),
    recycleBin: path.join('/', 'recycler-bin')
  }
}