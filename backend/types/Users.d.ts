declare global {
  namespace Users {
    interface User {
      uid: number
      name: string
      fullName: string
      email: string
      phone: string
    }
		interface New extends Omit<User, 'uid'> {
			password: string
		}
    interface Result extends User {
      password_hash: string
      isUserSystem: boolean
    }
    type Config = {
      [x: string]: any
    }
    interface Manager {
      create(newUser: Users.New): Promise<Users.User['uid']>
      get(name: Users.User['name']): Promise<Users.Result | null>
      getAll(includeUserSystem?: boolean): Promise<Users.Result[]>
      update(name: Users.User['name'], data: Partial<Users.User>): Promise<void>
      delete(uid: Users.User['uid']): Promise<void>
      setPassword(name: Users.User['name'], password: string): Promise<void>
    }
  }
}

export { }