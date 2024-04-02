declare const TOKEN: string
declare const KEY: string
declare const IS_DEV: boolean

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const generateKey = (): Promise<CryptoKey> => {
  return crypto.subtle.importKey('raw', encoder.encode(KEY.slice(0, 16)), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

class Encrypting {
  public async encrypt(data: string): Promise<string> {
    const newKey = await generateKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, newKey, encoder.encode(data)))
    const combined = new Uint8Array(iv.length + encrypted.length)
    combined.set(iv)
    combined.set(encrypted, iv.length)
    let result = ''
    for (let i = 0; i < combined.length; i++) {
      result += combined[i].toString(16).padStart(2, '0')
    }
    return result
  }
  public async decrypt(strEncrypted: string): Promise<string> {
    const newKey = await generateKey()
    let uint8Array = new Uint8Array(strEncrypted.length / 2)
    for (let i = 0; i < strEncrypted.length; i += 2) {
      uint8Array[i / 2] = parseInt(strEncrypted.substr(i, 2), 16)
    }
    const iv = uint8Array.slice(0, 12)
    const data = uint8Array.slice(12, uint8Array.length)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, newKey, data)
    return decoder.decode(decrypted)
  }
}
const encrypting: Encrypting = new Encrypting()
let _host = import.meta.resolve('./..')
const getURL = ({ endpoint, params = {} }: GetURLArgs): string => {
  const url = new URL(endpoint, _host)
  const keys = Object.keys(params)
  for (const key of keys) {
    url.searchParams.append(key, params[key])
  }
  return url.href
}

export class ServerConector {
  async send({ endpoint, method, data: body, params }: any): Promise<Response> {
    const headers: Headers = new Headers()
    headers.append('token', TOKEN)
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      let response: Response
      if (method === 'get') {
        response = await fetch(
          getURL({
            endpoint,
            params
          }),
          { headers }
        )
      } else {
        if (IS_DEV) {
          headers.append('Content-Type', 'application/json')
        }
        if (!IS_DEV && body) {
          body = await encrypting.encrypt(body)
        }
        response = await fetch(
          getURL({
            endpoint
          }),
          {
            method,
            headers,
            body
          }
        )
      }
      return response
    } else {
      throw new Error(`El método ${method} no es válido, utiliza 'get', 'post', 'put' o 'delete'.`)
    }
  }
}

interface GetURLArgs {
  endpoint: string
  params?: object
}