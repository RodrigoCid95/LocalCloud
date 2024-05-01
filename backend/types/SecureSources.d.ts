declare global {
  namespace SecureSources {
    interface New extends Omit<Source, 'id'> { }
    interface Result extends Omit<Source, 'id'> {
      id_source: number
    }
  }
}

export { }