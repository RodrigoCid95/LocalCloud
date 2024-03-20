import { v4 } from 'uuid'

export const tokens = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  if (!req.session.key) {
    req.session.key = v4()
  }
  if (!req.session.systemToken) {
    req.session.systemToken = v4()
  }
  next()
}