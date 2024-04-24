import { v4 } from 'uuid'

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
    if (req.originalUrl === '/') {
      res.redirect('/login')
    } else {
      res.redirect(`/login?dest=${req.originalUrl}`)
    }
  }
}
export const verifyNotSession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (!req.session.user) {
    next()
  } else {
    if (req.query.dest) {
      res.redirect(req.query.dest as string)
    } else {
      res.redirect('/')
    }
  }
}