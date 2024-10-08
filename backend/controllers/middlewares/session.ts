import { verifyDevMode } from "controllers/apis/middlewares/dev-mode"

export async function verifySession(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): Promise<void> {
  if (req.session.user) {
    next()
  } else {
    const model: Models<'DevModeModel'> | boolean = verifyDevMode.bind(this)()
    if (typeof model !== 'boolean') {
      req.session.user = model.getUser()
      req.session.apps = await model.getApps(req.session.user?.uid || NaN)
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
export const verifyNotSession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void => {
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