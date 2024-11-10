declare global {
  namespace Paths {
    interface Config {
      samba: string
      shadow: string
      passwd: string
      group: string
      system: {
        apps: string
        appsViews: string
        clientPublic: string
        clientViews: string
        storages: string
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
    interface GetAppGlobalStorageItemOptions {
      packageName: string
      item: string
    }
    interface GetAppUserStorageOptions {
      packageName: string
      user: string
    }
    interface GetAppUserStorageItemOptions extends GetAppUserStorageOptions {
      item: string
    }
    interface Class {
      readonly samba: string
      readonly shadow: string
      readonly passwd: string
      readonly groups: string
      readonly database: string
      readonly apps: string
      readonly appsTemplates: string
      readonly storages: string
      readonly users: string
      readonly shared: string
      readonly recycleBin: string
      getApp(packageName: string): string
      getAppStorage(packageName: string): string
      getAppGlobalStorage(packageName: string): string
      getAppGlobalStorageItem(opts: GetAppGlobalStorageItemOptions): string
      getAppUserStorage(opts: GetAppUserStorageOptions): string
      getAppUserStorageItem(opts: GetAppUserStorageItemOptions): string
      getUser(name: string): string
      getRecycleBin(name: string): string
      getRecycleBinItem(name: string, id: string): string
      resolveSharedPath(args: ResolveSharedPathArgs): string | boolean
      resolveUserPath(args: ResolveUsersPathArgs): string | boolean
    }
  }
}

export { }