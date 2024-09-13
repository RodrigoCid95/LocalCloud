declare global {
  namespace SMBManager {
    interface Class {
      create(name: Users.User['name']): Promise<void>
      delete(name: Users.User['name']): Promise<void>
    }
  }
}

export { }