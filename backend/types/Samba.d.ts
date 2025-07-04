declare global {
  namespace Samba {
    type Config = {
      [x: string]: string
    }
    type Configs = {
      [x: string]: Config
    }
    interface Manager {
      create(name: Users.User['name'], config?: Config, password?: string): void
      delete(name: Users.User['name']): void
    }
  }
}

export { }