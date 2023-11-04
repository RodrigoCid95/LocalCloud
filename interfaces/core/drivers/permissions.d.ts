export type Permission = 'geolocation' | 'notifications' | 'file-system'
export type PermissionState = 'granted' | 'denied' | 'prompt'
export type OnChangePermission = (permission: PermissionState) => void
export interface Permissions {
  query(permission: PermissionName): Promise<PermissionState>
  onChange(permission: PermissionName, callback: OnChangePermission): Promise<void>
  request(permission: Permission): Promise<boolean>
}
export interface PermissionsConstructable {
  new(): Permissions
}