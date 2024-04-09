declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
      extensions: string[]
      permissions: Omit<Permissions.Permission, 'id'>[]
      secureSources: Omit<SecureSources.Source, 'id'>[]
    }
    interface New extends Omit<Omit<App, 'permissions'>, 'secureSources'> {
      permissions: Omit<Omit<Permissions.Permission, 'id'>, 'active'>[]
      secureSources: Omit<Omit<SecureSources.Source, 'id'>, 'active'>[]
    }
    interface Result extends Omit<Omit<Omit<App, 'permissions'>, 'secureSources'>, 'extensions'> {
      extensions?: string
    }
  }
}

export { }