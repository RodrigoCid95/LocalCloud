declare global {
  namespace Permissions {
    interface Permission {
      id: string
      package_name: string
      api: string
      justification: string
      active: boolean
    }
    interface FindMethodArgs {
      package_name?: string
      api?: boolean
      active?: boolean
    }
    type FindMethod = (query: FindMethodArgs) => Promise<Permission[]>
    type EnableMethod = (id: Permission['id']) => Promise<void>
    type DisableMethod = (id: Permission['id']) => Promise<void>
    interface Connector {
      find: FindMethod
      enable: EnableMethod
      disable: DisableMethod
    }
  }
}

export { }