declare global {
  namespace Shared {
    interface Shared {
      id: string
      uid: string
      path: string[]
    }
    type ListMethod = () => Promise<Shared[]>
    type CreateMethod = (path: string[]) => Promise<Shared>
    type DeleteMethod = (id: Shared['id']) => Promise<void>
    interface Connector {
      list: ListMethod
      create: CreateMethod
      delete: DeleteMethod
    }
  }
}

export { }