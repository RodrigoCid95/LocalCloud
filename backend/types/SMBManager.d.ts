declare global {
  namespace SMBManager {
    interface Class {
      create(name: Users.User['name']): void
      delete(name: Users.User['name']): void
    }
  }
}

export { }