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

const users: string = path.resolve(systemDir, '.users')
const user: string = path.join(users, ':uuid')

export const paths: Paths.Config = {
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
    shared: path.join(users, 'shared'),
    path: users,
    user: {
      path: user
    },
    recycleBin: path.join(users, 'recycler-bin')
  }
}