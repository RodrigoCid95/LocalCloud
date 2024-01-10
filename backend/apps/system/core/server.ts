import type { EncryptorLib } from 'interfaces/Encryptor'
import type { Server } from './../..'
import { Encryptor } from './encryptor'

interface RequestWithResponseArgs {
  endpoint: string
  params?: any
}

interface RequestWithoutResponseArgs {
  endpoint: string
  method: string
  data?: any
}

const isJSON = (text: string): boolean => {
  return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}

export class ServerController implements Server {
  #key: string
  #encryptor: EncryptorLib
  constructor() {
    const keyRef = document.querySelector('[name="key"]') as HTMLInputElement
    this.#key = keyRef.value
    keyRef.remove()
    this.#encryptor = new Encryptor()
  }
  #getHeaders(): Headers {
    const headers = new Headers()
    headers.append('key', this.#key)
    return headers
  }
  #getURL(endpoint: string, params = {}): string {
    const url = new URL(endpoint, window.location.origin)
    const keys = Object.keys(params)
    for (const key of keys) {
      url.searchParams.append(key, params[key])
    }
    return url.href
  }
  async #requestWithResponse({ endpoint, params = {} }: RequestWithResponseArgs): Promise<any> {
    const response = await (await fetch(
      this.#getURL(endpoint, params),
      { headers: this.#getHeaders() }
    )).text()
    if (isJSON(response)) {
      return JSON.parse(response)
    }
    return response
  }
  async #requestWithoutResponse({ endpoint, method, data = {} }: RequestWithoutResponseArgs): Promise<void> {
    const body = await this.#encryptor.encrypt(this.#key, JSON.stringify(data))
    await fetch(
      this.#getURL(endpoint),
      {
        method,
        headers: this.#getHeaders(),
        body
      }
    )
  }
  async send({ endpoint, method, data, params }: any): Promise<any> {
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      if (method === 'get') {
        return this.#requestWithResponse({ endpoint, params })
      }
      await this.#requestWithoutResponse({ endpoint, method, data })
    } else {
      throw new Error(`El método ${method} no es válido, utiliza 'get', 'post', 'put' o 'delete'.`)
    }
  }
}