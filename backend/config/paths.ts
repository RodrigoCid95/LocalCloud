import type { PathsConfigProfile } from 'interfaces/Paths'
import path from 'node:path'

declare const isRelease: boolean

const system = isRelease ? path.resolve(__dirname, '..', '.system') : path.resolve(__dirname, '..', '..', '.system')
const systemApps = path.join(system, 'apps')
const systemApp = path.join(system, 'apps', ':packagename')
const systemDatabases = path.join(systemApp, 'data')

const users = isRelease ? path.resolve(__dirname, '..', '.users') : path.resolve(__dirname, '..', '..', '.users')
const user = path.join(users, ':uuid')

export const paths: PathsConfigProfile = {
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
    database: path.join(system, 'data.db')
  },
  users: {
    path: users,
    user: {
      path: user
    }
  }
}