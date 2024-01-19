import type { LocalCloud } from 'declarations'
import type { Next, Request, Response } from 'phoenix-js/http'

const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const userAccess = (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
  if (!req.headers.referer || !req.headers.host) {
    next(DENIED_ERROR)
  }
  const baseURL = `${req.protocol}://${req.headers.host}/`
  const referer = req.headers.referer
  if (referer !== baseURL) {
    next(DENIED_ERROR)
  }
  next()
}