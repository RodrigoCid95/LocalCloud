import type { DriverList } from './drivers'
import type { ViewsModule } from './view-controller'
import type { ServiceList } from './service'

export type AppModule = {
  Views: ViewsModule
  Services?: ServiceList
}
export interface Manifest {
  packageName: string
  title: string
  description?: string
  author?: string[]
  icon?: string
  dependences?: Array<keyof DriverList>
}