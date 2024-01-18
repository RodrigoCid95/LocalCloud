import type { App } from "interfaces/Apps"
import type { User } from "interfaces/Users"

interface SessionApp extends App {
  token: string
}

declare namespace LocalCloud {
  interface SessionData {
    user?: User
    permissions?: string[]
    apps: {
      [x: string]: SessionApp
    }
    key?: string
    systemToken: string
  }
}