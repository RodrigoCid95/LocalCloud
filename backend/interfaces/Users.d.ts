export interface User {
  uuid: string
	fullName: string
	userName: string
	photo: string
	email: string
	phone: string
}
export interface NewUser extends Partial<Omit<User, 'uuid'>> {
  password: string
}
export interface UserDBResult extends Omit<Omit<User, 'userName'>, 'fullName'> {
	full_name: string
	user_name: string
	password_hash: string
}