import Server from "kernel/lib/Server"
import WindowComponent from "kernel/lib/window"
import Service from 'kernel/lib/Service'
import Program from "kernel/lib/Program"
import OS from "kernel/lib/OS"

export interface ServiceArguments {
  server: Server
  manifest: Manifest
}

export interface AppArguments {
  manifest: Manifest
  WindowComponent: typeof WindowComponent
  readonly services: ServiceInstance[]
  launch: OS['launch']
}

export interface ProgramArguments extends AppArguments {
  Program: typeof Program
  launchService: OS['launchService']
}

export interface ServiceInstance {
  new(args: ServiceArguments): Service
}

export interface Manifest {
  name: string
  icon: string
  author: string[]
}

export interface ProgramManifest<A = ProgramArguments, C = typeof Program, T = 'program'> extends Manifest {
  callback: () => Promise<{ default: (args: A) => C | Promise<C> }>
  tag: string
  type: T
  services: string[]
}

export interface AppManifest extends ProgramManifest<AppArguments, typeof WindowComponent, 'app'> { }

export interface ServiceManifest extends Manifest {
  callback: () => Promise<{ default: (ClassService: typeof Service) => ServiceInstance | Promise<ServiceInstance> }>
  type: 'service'
}

export {
  Server,
  WindowComponent
}