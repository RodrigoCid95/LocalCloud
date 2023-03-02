import Server from "libs/Server"
import WindowComponent from "components/window"
import Service from 'Service'
import Program from "libs/Program"
import OS from "OS"

export interface Manifest<T> {
  title: string
  description?: string
  author?: string[]
  icon?: string
  services: {
    [x: string]: ChildService
  }
  type: T
}

export interface ServiceManifest extends Manifest<'service'> { }

export type ChildService = Omit<Omit<ServiceManifest, 'services'>, 'type'>

export interface ProgramManifest<T = 'program'> extends Manifest<T> {
  tag: string
}

export interface AppManifest extends ProgramManifest<'app'> { }

type BasedTask = {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly author: string[]
  readonly icon: string
}


export interface Task extends BasedTask {
  readonly PID: string
  readonly services: Service[]
  readonly type: 'service' | 'program' | 'app'
  readonly element: HTMLElement | Service
  kill(): Promise<void>
}

export interface AppArguments<T = 'app'> {
  manifest: Manifest<T>
  WindowComponent: typeof WindowComponent
  getService: <T>(serviceName: string) => T | undefined
  launch: OS['launch']
  args?: { [x: string]: any }
}

export interface ProgramArguments extends AppArguments<'program'> {
  Program: typeof Program
}

export interface ServiceInstance {
  new(server: Server): Service
}

export {
  Server,
  WindowComponent
}