declare global {
  namespace Apps {
    interface New extends App {
      permissions: Omit<Omit<Omit<Permissions.Permission, 'id'>, 'active'>, 'package_name'>[]
      secureSources: Omit<Omit<SecureSources.Source, 'id'>, 'active'>[]
    }
  }
}

export { }