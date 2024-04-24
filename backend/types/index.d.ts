import './Apps'
import './Database'
import './DevMode'
import './Encrypting'
import './Paths'
import './Permissions'
import './Recycle_bin'
import './Shared'
import './Users'

declare global {
  namespace LocalCloud {
    interface SessionApp extends Omit<Apps.App, 'package_name'> {
      token: string
      secureSources: SecureSources.Source[]
      permissions: Permissions.Permission[]
    }
    interface SessionData {
      user: Users.User
      apps: {
        [x: string]: SessionApp
      }
      key: string
      token: string
    }
  }
}

export { }