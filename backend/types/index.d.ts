import './Apps'
import './BuilderConnector'
import './Database'
import './DevMode'
import './Encrypting'
import './FS'
import './SMBManager'
import './Paths'
import './Permissions'
import './RecycleBin'
import './Shared'
import './Users'

declare global {
  namespace LocalCloud {
    interface SessionApp extends Omit<Apps.App, 'package_name'> {
      token: string
      secureSources: SecureSources.Source[]
      permissions: Permissions.Permission[]
      useTemplate: boolean
    }
    interface SessionApps {
      [package_name: string]: SessionApp
    }
    interface SessionData {
      user: Users.User | null
      apps: SessionApps
      key: string
      token: string
    }
  }
}

export { }