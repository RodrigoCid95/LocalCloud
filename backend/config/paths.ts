import path from 'node:path'

const system = path.resolve(process.cwd(), 'lc')

export const paths: Paths.Config = {
  samba: '/etc/samba/smb.conf',
  shadow: '/etc/shadow',
  passwd: '/etc/passwd',
  groups: '/etc/group',
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
    shared: path.join('/', 'shared'),
    path: path.join('/', 'home'),
    recycleBin: path.join('/', 'recycler-bin')
  }
}