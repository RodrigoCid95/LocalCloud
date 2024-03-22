import { Encrypt } from 'libraries/classes/Encrypt'

const encrypt: Encrypt = new Encrypt()

const isJSON = (text: string): boolean => /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const decryptRequest = async (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  let nextError: any = undefined
  if (req.headers['key'] && req.headers['key'] === req.session.key && typeof req.body === 'string') {
    try {
      const result = await encrypt.decrypt(req.headers['key'], req.body)
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