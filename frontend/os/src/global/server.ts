import type { ServerConnector } from './../interfaces/Server'
import { Encrypting } from './encrypting'

export class ServerController implements ServerConnector {
  #headers: Headers
  encrypting: Encrypting.Class
  constructor() {
    const key = document.documentElement.getAttribute('key') || ''
    document.documentElement.removeAttribute('key')
    const token = document.documentElement.getAttribute('token') || ''
    document.documentElement.removeAttribute('token')
    this.#headers = new Headers()
    this.#headers.append('token', token)
    this.encrypting = new Encrypting()
    this.encrypting.setKey(key)
  }
  #getURL(endpoint: string, params = {}): string {
    const url = new URL(endpoint, window.location.origin)
    const keys = Object.keys(params)
    for (const key of keys) {
      url.searchParams.append(key, params[key])
    }
    return url.href
  }
  async send({ endpoint, method, body, params }: any): Promise<Response> {
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      let response: Response
      if (method === 'get') {
        response = await fetch(
          this.#getURL(endpoint, params),
          { headers: this.#headers }
        )
      } else {
        response = await fetch(
          this.#getURL(endpoint),
          {
            method,
            headers: this.#headers,
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