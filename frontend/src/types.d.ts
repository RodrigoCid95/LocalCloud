import Program from "kernel/lib/Program"
import OS from "kernel/lib/OS"
import Server from "kernel/lib/Server"
import WindowComponent from "kernel/lib/window"

export type Manifest = {
  title: string
  icon: string
  author: string[]
  tag: string
}

export type KIT = {
  Program: typeof Program,
  WindowComponent: typeof WindowComponent,
  server: Server,
  launch: OS['launch'],
  manifest: Manifest
}

export {
  Program,
  Server,
  WindowComponent
}