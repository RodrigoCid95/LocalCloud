declare global {
  namespace GroupManager {
    interface Group {
      gid: number
      name: string
      users: string[]
    }
    interface Class {
      addGroup(name: Group['name']): Group['gid']
      removeGroup(name: Group['name']): void
      addUser(users: string): void
      getUsers(): string[]
      removeUser(user: string): void
    }
  }
}

export { }