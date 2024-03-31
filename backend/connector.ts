declare const TOKEN: string
declare const KEY: string

class Encrypting {
  #key!: string
  #encoder = new TextEncoder()
  #decoder = new TextDecoder()
  public setKey = (key: string) => this.#key = key
  #generateKey(key: string): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', this.#encoder.encode(key.slice(0, 16)), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  }
  public async encrypt(data: string): Promise<string> {
    const newKey = await this.#generateKey(this.#key)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, newKey, this.#encoder.encode(data)))
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
    const newKey = await this.#generateKey(this.#key)
    let uint8Array = new Uint8Array(strEncrypted.length / 2)
    for (let i = 0; i < strEncrypted.length; i += 2) {
      uint8Array[i / 2] = parseInt(strEncrypted.substr(i, 2), 16)
    }
    const iv = uint8Array.slice(0, 12)
    const data = uint8Array.slice(12, uint8Array.length)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, newKey, data)
    return this.#decoder.decode(decrypted)
  }
}

const headers: Headers = new Headers()
headers.append('token', TOKEN)
const encrypting: Encrypting = new Encrypting()
encrypting.setKey(KEY)
const getURL = (endpoint: string, params = {}): string => {
  const url = new URL(endpoint, window.location.origin)
  const keys = Object.keys(params)
  for (const key of keys) {
    url.searchParams.append(key, params[key])
  }
  return url.href
}

class ServerConector {
  get encrypting(): Encrypting {
    return encrypting
  }
  async send({ endpoint, method, data: body, params }: any): Promise<Response> {
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      let response: Response
      if (method === 'get') {
        response = await fetch(
          getURL(endpoint, params),
          { headers }
        )
      } else {
        response = await fetch(
          getURL(endpoint),
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

Object.defineProperty(window, 'server', { value: new ServerConector(), writable: false })