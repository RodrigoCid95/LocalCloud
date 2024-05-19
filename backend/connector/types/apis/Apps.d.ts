declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
      extensions?: string[]
      useStorage?: boolean
    }
    type ListMethod = () => Promise<App[]>
    type ListByUIDMethod = (uid: Users.User['uid']) => Promise<App[]>
    type InstallMethod = (file: File) => FileTransfer
    type UninstallMethod = (package_name: App['package_name']) => Promise<void>
    interface Connector {
      list: ListMethod
      listByUID: ListByUIDMethod
      install: InstallMethod
      uninstall: UninstallMethod
    }
  }
}

export { }