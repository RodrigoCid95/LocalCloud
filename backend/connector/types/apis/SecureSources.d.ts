declare global {
  namespace SecureSources {
    interface Source {
      id: string
      package_name: string
      type: 'image' | 'media' | 'object' | 'script' | 'style' | 'worker' | 'font' | 'connect'
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