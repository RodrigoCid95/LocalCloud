declare global {
  namespace RecycleBin {
    interface Item {
      id: string
      uuid: string
      path: string[]
      date: string
    }
    interface New extends Partial<Omit<Item, 'id'>> { }
    interface Result extends Omit<Item, 'path'> {
      path: string
    }
  }
}

export { }