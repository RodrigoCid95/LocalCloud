import type { LocalCloud } from "declarations"
import type { Next, Request, Response } from "phoenix-js/http"
import { v4 } from 'uuid'
import { Encryptor } from '../../libraries/Encrypting'

const encryptor = new Encryptor()
const isJSON = (text: string): boolean => {
  return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}
const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const verifySession = (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
  if (!req.session.key) {
    req.session.key = v4()
  }
  if (req.session.user) {
    next()
  } else {
    res.redirect('/?dest=' + req.originalUrl)
  }
}
export const decryptRequest = async (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
  let nextError: any = undefined
  if (req.headers['key'] && req.headers['key'] === req.session.key && typeof req.body === 'string') {
    try {
      const result = await encryptor.decrypt(req.headers['key'], req.body)
      if (isJSON(result)) {
        req.body = JSON.parse(result)
      } else {
        req.body = result
      }
    } catch (error) {
      nextError = DENIED_ERROR
    }
  } else {
    nextError = DENIED_ERROR
  }
  next(nextError)
}
export const verifyAPIPermission = async (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
  let nextError: any = undefined
  if (!req.session.user) {
    nextError = DENIED_ERROR
  }
  if (!req.headers['token']) {
    nextError = DENIED_ERROR
  }
  next(nextError)
}