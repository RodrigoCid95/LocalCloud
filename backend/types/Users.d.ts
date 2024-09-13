declare global {
	namespace Users {
		interface Result extends User {
			password_hash: string
		}
	}
	namespace UserManager {
		interface Class {
			create(newUser: Users.New): Users.User['uid']
			get(name: Users.User['name']): Users.Result | null
			getAll(): Users.Result[]
			update(name: Users.User['name'], data: Partial<Users.User>): void
			delete(uid: Users.User['uid']): void
			updatePassword(name: Users.User['name'], password: string): void
		}
	}
}

export { }