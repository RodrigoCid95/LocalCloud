import path from 'node:path'

declare const flags: PXIO.Flags

let systemDir = flags.get('system-dir') as string

if (systemDir) {
  systemDir = path.resolve(systemDir)
} else {
  systemDir = path.resolve(__dirname, '..')
}

const system: string = path.join(systemDir, '.lc')
const systemApps: string = path.join(system, 'apps')
const systemApp: string = path.join(system, 'apps', ':packagename')
const systemDatabases: string = path.join(systemApp, 'data')

export const paths: Paths.Config = {
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