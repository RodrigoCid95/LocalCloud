import { WithId } from "mongodb"

declare global {
  namespace RecycleBin {
    interface New extends Partial<Omit<Item, 'id'>> { }
    type Result = WithId<Omit<Item, 'id'>>
  }
}

export { }