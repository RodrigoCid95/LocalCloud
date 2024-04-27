declare global {
  namespace Sources {
    interface Source {
      id: number
      package_name: string
      type: string
      source: string
      justification: string
      active: boolean
    }
    interface FindMethodArgs {
      package_name?: string
      api?: boolean
      active?: boolean
    }
    type FindMethod = (query: Partial<FindMethodArgs>) => Promise<Source[]>
    type EnableMethod = (id: Source['id']) => Promise<void>
    type DisableMethod = (id: Source['id']) => Promise<void>
    interface Connector {
      find: FindMethod
      enable: EnableMethod
      disable: DisableMethod
    }
  }
}

export { }