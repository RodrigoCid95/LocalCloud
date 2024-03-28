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
	}
}

export { }