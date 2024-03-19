import './Apps'
import './Database'
import './Encrypting'
import './Paths'
import './Users'

interface SessionApp extends Apps.App {
  token: string
}

declare global {
  namespace LocalCloud {
    interface SessionData {
      user?: Users.User
      apps: {
        [x: string]: SessionApp
      }
      key?: string
      systemToken: string
    }
  }
}

export { }