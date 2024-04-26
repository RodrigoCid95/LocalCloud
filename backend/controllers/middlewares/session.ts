import { verifyDevMode } from "controllers/apis/middlewares/dev-mode"

export async function verifySession(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): Promise<void> {
  if (req.session.user) {
    next()
  } else {
    const model = verifyDevMode.bind(this)()
    if (model) {
      req.session.user = await model.getUser()
      req.session.apps = await model.getApps()
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