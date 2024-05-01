declare global {
  namespace Permissions {
    interface New extends Omit<Permission, 'id'> { }
    interface Result extends Omit<Permission, 'id'> {
      id_permission: number
    }
  }
}

export { }