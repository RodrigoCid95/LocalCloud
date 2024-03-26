declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
      permissions: Omit<Permissions.Permission, 'id'>[]
      secureSources: Omit<SecureSources.Source, 'id'>[]
    }
    type New = Partial<App>
    interface Result extends Omit<Omit<App, 'permissions'>, 'secureSources'> { }
  }
}

export { }