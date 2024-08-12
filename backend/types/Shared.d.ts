declare global {
  namespace Shared {
    
    type New = Omit<Shared, 'id'>
    interface Result extends Omit<Shared, 'path'> {
      path: string
    }
  }
}

export { }