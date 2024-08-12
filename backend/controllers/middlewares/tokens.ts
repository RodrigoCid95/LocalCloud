import crypto from 'node:crypto'
import { verifyDevMode } from 'controllers/apis/middlewares/dev-mode'

export function tokens(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void {
  const model = verifyDevMode.bind(this)()
  if (model) {
    next()
    return
  }
  if (!req.session.key) {
    req.session.key = crypto.randomUUID()
  }
  if (!req.session.token) {
    req.session.token = crypto.randomUUID()
  }
  next()
}