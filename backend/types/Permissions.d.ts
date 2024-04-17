declare global {
  namespace Permissions {
    interface Permission {
      id: number
      package_name: string
      api: string
      justification: string
      active: boolean
    }
    interface New extends Omit<Permission, 'id'> { }
    interface Result extends Omit<Permission, 'id'> {
      id_permission: number
    }
  }
}

export { }