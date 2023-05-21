export enum Permissions {
  GEOLOCATION = 'geolocation',
  NOTIFICATIONS = 'notifications'
}
export enum PermissionStates {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt'
}
export type Permission = typeof Permissions[keyof typeof Permissions]
export type PermissionState = typeof PermissionStates[keyof typeof PermissionStates]
export interface IPermissions {
  query(name: Permission): Promise<PermissionState>
  onChange
}
export interface IPermissionsClass {
  new(): IPermissions
}
