declare global {
  namespace Paths {
    interface Config {
      samba: string
      shadow: string
      passwd: string
      groups: string
      system: {
        path: string
        apps: {
          path: string
          app: {
            path: string
            public: string
            databases: {
              path: string
              database: string
            }
          }
        }
        database: string
      }
      users: {
        path: string
        shared: string
        recycleBin: string
      }
    }
    interface ResolveSharedPathArgs {
      verify?: boolean
      segments: string[]
    }
    interface ResolveUsersPathArgs extends ResolveSharedPathArgs {
      name: string
    }
    interface Class {
      readonly samba: string
      readonly shadow: string
      readonly passwd: string
      readonly groups: string
      readonly system: string
      readonly database: string
      readonly apps: string
      readonly users: string
      readonly shared: string
      readonly recycleBin: string
      getApp(packagename: string): string
      getAppPublic(packagename: string): string
      getAppDatabases(packagename: string): string
      getAppDatabase(packagename: string, name: string): string
      getUser(name: string): string
      getRecycleBin(name: string): string
      getRecycleBinItem(name: string, id: string): string
      resolveSharedPath(args: ResolveSharedPathArgs): string | boolean
      resolveUserPath(args: ResolveUsersPathArgs): string | boolean
    }
  }
}

export { }