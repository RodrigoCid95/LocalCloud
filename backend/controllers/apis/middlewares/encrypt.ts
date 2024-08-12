import { Encrypt } from 'libraries/classes/Encrypt'
import { verifyDevMode } from './dev-mode'

const encrypt: Encrypt = new Encrypt()

const isJSON = (text: string): boolean => /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export async function decryptRequest(req: PXIOHTTP.Request<LocalCloud.SessionData>, _: PXIOHTTP.Response, next: PXIOHTTP.Next): Promise<void> {
  if (verifyDevMode.bind(this)()) {
    next()
    return
  }
  let nextError: any = undefined
  if (req.session.key && typeof req.body === 'string') {
    try {
      const result = await encrypt.decrypt(req.session.key, req.body)
      if (isJSON(result)) {
        req.body = JSON.parse(result)
      } else {
        req.body = result
      }
    } catch (error) {
      nextError = DENIED_ERROR
    }
  }
  next(nextError)
}