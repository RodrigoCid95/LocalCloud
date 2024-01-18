import type { EncryptorLib } from './../interfaces/Encryptor'
import type { ServerConnector } from './../interfaces/Server'
import { Encryptor } from './encryptor'

const isJSON = (text: string): boolean => {
  return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}

export class ServerController implements ServerConnector {
  #headers: Headers
  #encryptor: EncryptorLib
  constructor() {
    const keyRef = document.querySelector('[name="key"]') as HTMLInputElement
    const tokenRef = document.querySelector('[name="token"]') as HTMLInputElement
    this.#headers = new Headers()
    if (keyRef) {
      this.#headers.append('key', keyRef.value)
      keyRef.remove()
    }
    if (tokenRef) {
      this.#headers.append('token', tokenRef.value)
      tokenRef.remove()
    }
    this.#encryptor = new Encryptor()
  }
  #getURL(endpoint: string, params = {}): string {
    const url = new URL(endpoint, window.location.origin)
    const keys = Object.keys(params)
    for (const key of keys) {
      url.searchParams.append(key, params[key])
    }
    return url.href
  }
  async send({ endpoint, method, data, params }: any): Promise<any> {
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      let response: Response | string
      if (method === 'get') {
        response = await fetch(
          this.#getURL(endpoint, params),
          { headers: this.#headers }
        )
      } else {
        const key = this.#headers.get('key')
        const body = await this.#encryptor.encrypt(key || '12341234', JSON.stringify(data))
        response = await fetch(
          this.#getURL(endpoint),
          {
            method,
            headers: this.#headers,
            body
          }
        )
      }
      response = await response.text()
      if (isJSON(response)) {
        return JSON.parse(response)
      }
      return response
    } else {
      throw new Error(`El método ${method} no es válido, utiliza 'get', 'post', 'put' o 'delete'.`)
    }
  }
}