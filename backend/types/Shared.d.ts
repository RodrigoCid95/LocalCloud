declare global {
  namespace Shared {
    interface Shared {
      id: string
      uuid: string
      path: string[]
    }
    interface New extends Partial<Shared> { }
    interface Result extends Omit<Shared, 'path'> {
      path: string
    }
  }
}

export { }