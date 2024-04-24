import { v4 } from 'uuid'

const REQUIRED_LOGIN = {
  code: 'required-login',
  message: 'Inicio de sesión requerido.'
}

export async function verifySession(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): Promise<void> {
  if (req.session.user) {
    next()
  } else {
    const _this: any = this
    const model = (_this?.devModeModel as Models<'DevModeModel'> | undefined)
    if (model?.isDevMode?.isDevMode) {
      req.session.user = await model.getUser()
      req.session.apps = {}
      const apps = await model.getApps()
      for (const app of apps) {
        const sessionApp: LocalCloud.SessionApp = {
          token: v4(),
          ...app,
          secureSources: [],
          permissions: []
        }
        req.session.apps[app.package_name] = sessionApp
      }
      next()
      return
    }
    res.status(401).json(REQUIRED_LOGIN)
  }
}