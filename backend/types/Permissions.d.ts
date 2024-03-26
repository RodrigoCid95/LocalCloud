declare global {
  namespace Permissions {
    interface Permission {
      id: number
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