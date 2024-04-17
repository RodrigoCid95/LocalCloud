declare global {
  namespace SecureSources {
    interface Source {
      id: number
      package_name: string
      type: string
      source: string
      justification: string
      active: boolean
    }
    interface New extends Omit<Source, 'id'> { }
    interface Result extends Omit<Source, 'id'> {
      id_source: number
    }
  }
}

export { }