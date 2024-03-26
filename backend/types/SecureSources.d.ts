declare global {
  namespace SecureSources {
    interface Source {
      id: number
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