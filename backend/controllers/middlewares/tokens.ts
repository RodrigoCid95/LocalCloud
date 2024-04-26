import { v4 } from 'uuid'
import { verifyDevMode } from 'controllers/apis/middlewares/dev-mode'

export function tokens(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void {
  const model = verifyDevMode.bind(this)()
  if (model) {
    next()
    return
  }
  if (!req.session.key) {
    req.session.key = v4()
  }
  if (!req.session.token) {
    req.session.token = v4()
  }
  next()
}