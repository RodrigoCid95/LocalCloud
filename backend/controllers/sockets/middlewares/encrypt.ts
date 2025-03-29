import { Encrypt } from 'libraries/Encrypt'

const encrypt: Encrypt = new Encrypt()

const isJSON = (text: string): boolean => /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const decryptRequest: PXIOSockets.Middleware<string> = async (args) => {
  if (!args.socket.request?.session?.key) {
    throw DENIED_ERROR
  }
  if (args.data) {
    const decrypted = await encrypt.decrypt(args.socket.request.session.key, args.data)
    args.data = isJSON(decrypted) ? JSON.parse(decrypted) : decrypted
  }
}