import './Apps'
import './Auth'
import './FS'
import './Permissions'
import './Profile'
import './RecycleBin'
import './Shared'
import './Sources'
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
    sources: Sources.Connector
    users: Users.Connector
  }
  interface Window {
    connectors: Connectors
  }
}

export { }