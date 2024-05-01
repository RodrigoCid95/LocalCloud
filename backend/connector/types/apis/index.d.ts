import './Apps'
import './Auth'
import './FS'
import './Permissions'
import './Profile'
import './RecycleBin'
import './Shared'
import './SecureSources'
import './Users'

declare global {
  interface Connectors {
    auth: Auth.Connector
    apps: Apps.Connector
    fs: FS.Connector
    permissions: Permissions.Connector
    profile: Profile.Connector
    recycleBin: RecycleBin.Connector
    shared: Shared.Connector
    sources: SecureSources.Connector
    users: Users.Connector
  }
}

export { }