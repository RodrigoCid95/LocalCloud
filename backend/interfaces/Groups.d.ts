export interface Group {
  id: number
  name: string
  description: string
  permissions: string[]
}
export type NewGroup = Partial<Omit<Group, 'id'>>
export interface GroupDBResult extends Omit<Omit<Group, 'id'>, 'permissions'> {
  id_group: number
  permissions: string
}
export interface GroupUsersDBResult {
  id_group: number
  uuid: string
}
export interface GroupAppsDBResult {
  id_group: number
  id_app: number
}