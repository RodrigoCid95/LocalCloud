declare global {
  namespace Apps {
    interface New extends App {
      permissions: Omit<Omit<Omit<Permissions.Permission, 'id'>, 'active'>, 'package_name'>[]
      secureSources: Omit<Omit<SecureSources.Source, 'id'>, 'active'>[]
    }
    interface Result extends Omit<Omit<App, 'extensions'>, 'useStorage'> {
      use_storage: 1 | 0
      extensions?: string
    }
  }
}

export { }