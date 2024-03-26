declare global {
	namespace Users {
		interface User {
			uuid: string
			full_name: string
			user_name: string
			photo: string
			email: string
			phone: string
		}
		interface New extends Omit<Omit<User, 'uuid'>, 'photo'> {
			password: string
		}
		interface Result extends User {
			password_hash: string
		}
	}
}

export { }