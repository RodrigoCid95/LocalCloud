declare global {
  namespace Groups {
    interface Group {
      gid: number
      name: string
      users: string[]
    }
    interface Manager {
      addGroup(name: Group['name']): Promise<Group['gid']>
      removeGroup(name: Group['name']): Promise<void>
      addUser(user: string): Promise<void>
      getUsers(): Promise<string[]>
      removeUser(user: string): Promise<void>
    }
  }
}

export { }