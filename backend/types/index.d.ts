import './Apps'
import './Database'
import './Encrypting'
import './Paths'
import './Users'

declare global {
  namespace LocalCloud {
    interface SessionApp extends Omit<Apps.App, 'package_name'> {
      token: string
    }
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