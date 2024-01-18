import { LocalCloud } from "declarations"
import type { Next, Request, Response } from "phoenix-js/http"
import { v4 } from 'uuid'

export const tokens = (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
  if (!req.session.key) {
    req.session.key = v4()
  }
  if (!req.session.systemToken) {
    req.session.systemToken = v4()
  }
  next()
}