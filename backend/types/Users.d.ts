export type Role = 'admin' | 'standard'
export interface User {
  uuid: string
  name: string
  fullName: string
  email: string
  role: Role
}
export interface NewUser extends User {
  password: string
}
export interface ResultUser extends User {
  hash: string
}