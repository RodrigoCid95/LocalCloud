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
		interface New extends User {
			password: string
		}
		interface Result extends User {
			password_hash: string
		}
	}
}

export { }