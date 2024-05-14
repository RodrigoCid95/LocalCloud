declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
    }
    type ListMethod = () => Promise<App[]>
    type ListByUUIDMethod = (name: Users.User['name']) => Promise<App[]>
    type InstallMethod = (file: File) => FileTransfer
    type UninstallMethod = (package_name: App['package_name']) => Promise<void>
    interface Connector {
      list: ListMethod
      listByUUID: ListByUUIDMethod
      install: InstallMethod
      uninstall: UninstallMethod
    }
  }
}

export { }