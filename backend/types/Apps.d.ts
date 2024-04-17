declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
      extensions: string[]
    }
    interface New extends App {
      permissions: Omit<Omit<Omit<Permissions.Permission, 'id'>, 'active'>, 'package_name'>[]
      secureSources: Omit<Omit<SecureSources.Source, 'id'>, 'active'>[]
    }
    interface Result extends Omit<App, 'extensions'> {
      extensions?: string
    }
  }
}

export { }