import type { CipherDriver } from './cipher'
import type { EmittersConstructable } from './emitter'
import type { GeolocationDriver } from './geolocation'
import type { LocalNotificationsDriver } from './notifications'
import type { Permissions } from './permissions'
import type { APIConnectorConstructable } from './api-connector'

export interface DriverList {
  cipher: CipherDriver
  emitters: EmittersConstructable
  geolocation: GeolocationDriver
  localNotifications: LocalNotificationsDriver
  permissions: Permissions
  'api-connector': APIConnectorConstructable
}
export function Driver(name: keyof DriverList): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>