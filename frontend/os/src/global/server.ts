import type { EncryptorLib } from './../interfaces/Encryptor'
import type { ServerConnector } from './../interfaces/Server'
import { Encryptor } from './encryptor'

const isJSON = (text: string): boolean => {
  return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}

export class ServerController implements ServerConnector {
  #headers: Headers
  encryptor: EncryptorLib
  constructor() {
    const key = document.documentElement.getAttribute('key') || ''
    document.documentElement.removeAttribute('key')
    const token = document.documentElement.getAttribute('token') || ''
    document.documentElement.removeAttribute('token')
    this.#headers = new Headers()
    this.#headers.append('key', key)
    this.#headers.append('token', token)
    this.encryptor = new Encryptor()
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
        const body = await this.encryptor.encrypt(key || '12341234', JSON.stringify(data))
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