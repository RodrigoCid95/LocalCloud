import type { WithId } from "mongodb"

declare global {
  namespace Permissions {
    interface New extends Omit<Permission, 'id'> { }
    type Result = WithId<Omit<Permission, 'id'>>
  }
}

export { }