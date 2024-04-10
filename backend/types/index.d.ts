import './Apps'
import './Database'
import './DevMode'
import './Encrypting'
import './Paths'
import './Permissions'
import './Users'

declare global {
  namespace Express {
      interface Request {
          files?: {
            name: string
            content: Buffer
          }[]
      }
  }
}

declare global {
  namespace LocalCloud {
    interface SessionApp extends Omit<Apps.App, 'package_name'> {
      token: string
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