declare global {
	namespace Users {
		interface New extends Omit<Omit<User, 'uuid'>, 'photo'> {
			password: string
		}
		interface Result extends User {
			password_hash: string
		}
	}
}

export { }