import type { EncryptorLib } from './../interfaces/Encryptor'
import type { ServerConnector } from './../interfaces/Server'
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
  async #requestWithResponse({ endpoint, params = {} }: RequestWithResponseArgs): Promise<any> {
    const response = await (await fetch(
      this.#getURL(endpoint, params),
      { headers: this.#headers }
    )).text()
    if (isJSON(response)) {
      return JSON.parse(response)
    }
    return response
  }
  async #requestWithoutResponse({ endpoint, method, data = {} }: RequestWithoutResponseArgs): Promise<void> {
    const body = await this.#encryptor.encrypt(this.#headers.get('key') || '12341234', JSON.stringify(data))
    await fetch(
      this.#getURL(endpoint),
      {
        method,
        headers: this.#headers,
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