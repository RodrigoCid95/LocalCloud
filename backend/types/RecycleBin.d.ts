declare global {
  namespace RecycleBin {
    interface New extends Partial<Omit<Item, 'id'>> { }
    interface Result extends Omit<Item, 'path'> {
      path: string
    }
  }
}

export { }