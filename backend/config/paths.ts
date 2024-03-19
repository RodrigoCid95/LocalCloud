import path from 'node:path'

const system: string = path.resolve(__dirname, '..', '.system')
const systemApps: string = path.join(system, 'apps')
const systemApp: string = path.join(system, 'apps', ':packagename')
const systemDatabases: string = path.join(systemApp, 'data')

const users: string = path.resolve(__dirname, '..', '.users')
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
    path: users,
    user: {
      path: user
    }
  }
}