declare global {
  namespace RecycleBin {
    interface Item {
      id: string
      uid: number
      path: string[]
      date: string
    }
    type ListMethod = () => Promise<Item[]>
    interface AddMethodResult {
      code: 'not-found' | 'bad-request'
      message: string
    }
    type AddMethod = (path: string[]) => Promise<true | AddMethodResult>
    type RestoreMethod = (id: Item['id']) => Promise<void>
    type DeleteMethod = (id: Item['id']) => Promise<void>
    type CleanMethod = () => Promise<void>
    interface Connector {
      list: ListMethod
      add: AddMethod
      restore: RestoreMethod
      delete: DeleteMethod
      clean: CleanMethod
    }
  }
}

export { }