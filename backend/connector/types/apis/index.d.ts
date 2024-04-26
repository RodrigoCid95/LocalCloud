import './Auth'
import './Users'
import './Apps'
import './Profile'

declare global {
  interface Connectors {
    auth?: Auth.Connector
    apps?: any
    fs?: any
    permissions?: any
    profile?: Profile.Connector
    recycleBin?: any
    shared?: any
    sources?: any
    users?: any
  }
  interface Window {
    connectors: Connectors
  }
}

export { }