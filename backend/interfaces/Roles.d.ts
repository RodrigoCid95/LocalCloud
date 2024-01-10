export interface Rol {
  id: number
  name: string
  description: string
  permissions: string[]
}
export type NewRol = Partial<Omit<Rol, 'id'>>
export interface RolDBResult extends Omit<Omit<Rol, 'id'>, 'permissions'> {
  id_rol: number
  permissions: string
}
export interface RolUsersDBResult {
  id_rol: number
  uuid: string
}
export interface RolAppsDBResult {
  id_rol: number
  id_app: number
}