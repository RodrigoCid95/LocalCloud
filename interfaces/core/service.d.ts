import { DriverList } from './drivers'

export declare class Service {
  getDriver<K extends keyof DriverList>(name: K): Promise<DriverList[K]>
  onKill(): void | Promise<void>
}
export interface ServiceConstructable {
  new(): Service
}
export type GetService = <S = Service>(serviceName: string) => Promise<S>
export type ServiceModule = { default: ServiceConstructable }
export type LoadServiceModule = () => Promise<ServiceModule>
export type ServiceList = { [x: string]: ServiceConstructable | LoadServiceModule }