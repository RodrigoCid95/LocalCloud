declare global {
  namespace Shared {
    interface New {
      path: string[]
    }
    interface Result extends Omit<Shared, 'path'> {
      path: string
    }
  }
}

export { }