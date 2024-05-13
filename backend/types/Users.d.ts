declare global {
	namespace Users {
		interface Result extends User {
			password_hash: string
		}
	}
}

export { }