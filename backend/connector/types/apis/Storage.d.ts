declare global {
  namespace Storage {
    interface Connector {
      global: {
        set<T = {}>(name: string, data: T): Promise<void>
        get<T = {}>(name: string): Promise<T>
      }
      user: {
        set<T = {}>(name: string, data: T): Promise<void>
        get<T = {}>(name: string): Promise<T>
      }
    }
  }
}

export { }