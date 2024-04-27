declare global {
  namespace Shared {
    interface Shared {
      id: string
      uuid: string
      path: string[]
    }
    interface New {
      path: string[]
    }
    interface Result extends Omit<Shared, 'path'> {
      path: string
    }
  }
}

export { }