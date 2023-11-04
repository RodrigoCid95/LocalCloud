import type { LocalCloud } from "declarations"
import type { Next, Request, Response } from "phoenix-js/http"
import { v4 } from 'uuid'
import { Encryptor } from './../../libraries/classes/Encryptor'

const encryptor = new Encryptor()
const isJSON = (text: string): boolean => {
  return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}
const deniedError = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const verifyPageSession = (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
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
  if (req.headers['key'] && req.headers['key'] === req.session.key && req.body.data) {
    try {
      const result = await encryptor.decrypt(req.headers['key'], req.body.data)
      if (isJSON(result)) {
        req.body = JSON.parse(result)
      } else {
        req.body.data = result
      }
    } catch (error) {
      nextError = deniedError
    }
  } else {
    nextError = deniedError
  }
  next(nextError)
}
export const verifyAPISession = async (req: Request<LocalCloud.SessionData>, res: Response, next: Next) => {
  let nextError: any = undefined
  if (!req.session.user) {
    nextError = deniedError
  }
  if (!req.headers['token']) {
    nextError = deniedError
  }
  next(nextError)
}