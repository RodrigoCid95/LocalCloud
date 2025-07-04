declare global {
  namespace LocalCloud {
    interface SessionApp extends Omit<Apps.App, 'package_name'> {
      token: string
      secureSources: SecureSources.Source[]
      permissions: string[]
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