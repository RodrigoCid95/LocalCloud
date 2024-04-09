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
let _host = IS_DEV ? import.meta.resolve('./..') : location.origin
const getURL = ({ endpoint, params = {} }: GetURLArgs): string => {
  const url = new URL(endpoint, _host)
  const keys = Object.keys(params)
  for (const key of keys) {
    url.searchParams.append(key, params[key])
  }
  return url.href
}

interface FileOptions {
  name: string
  file: File
}

interface MetaData {
  [x: string]: string
}

class FileUploader {
  #xhr: XMLHttpRequest
  #form: FormData
  constructor(endpoint: string, { name, file }: FileOptions, metadata?: MetaData) {
    this.#xhr = new XMLHttpRequest()
    this.#form = new FormData()
    this.#form.append(name, file)
    if (metadata) {
      const keys = Object.keys(metadata)
      for (const key of keys) {
        this.#form.append(key, metadata[key])
      }
    }
    this.#xhr.open('POST', getURL({ endpoint }), true)
    this.#xhr.setRequestHeader('token', TOKEN)
  }
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    if (event === 'end') {
      this.#xhr.addEventListener('load', () => {
        const isJSON = this.#xhr.getResponseHeader('content-type')?.includes('application/json')
        if (isJSON) {
          callback(JSON.parse(this.#xhr.response))
        } else {
          callback()
        }
      })
      return
    }
    if (event === 'abort') {
      this.#xhr.addEventListener('abort', callback)
      return
    }
    if (event === 'error') {
      this.#xhr.addEventListener('error', callback)
      return
    }
    this.#xhr.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        callback(percentComplete)
      }
    })
  }
  start = () => this.#xhr.send(this.#form)
  cancel = () => this.#xhr.abort()
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
  createUploader = (endpoint: string, file: FileOptions, metadata?: MetaData) => new FileUploader(endpoint, file, metadata)
  createURL = (...path: string[]): URL => new URL(path.join('/'), _host)
  #launch(...path: string[]): void {
    const url = this.createURL(path.join('/'))
    console.log(url.href)
    window.open(url.href, undefined, 'popup,noopener,noopener')
  }
  launchFile = (base: 'shared' | 'user', ...path: string[]) => this.#launch('launch', base, ...path)
  launchApp(package_name: string, params: LaunchAppParams = {}) {
    const strParams = Object.entries(params).map(([key, value]) => {
      switch (typeof value) {
        case 'number':
          return `${key}=${value.toString()}`
        case 'boolean':
          return key
        default:
          return `${key}=${value}`
      }
    }).join('&')
    if (strParams === '') {
      this.#launch('app', package_name)
    } else {
      this.#launch('app', package_name, `?${strParams}`)
    }
  }
}

interface LaunchAppParams {
  [key: string]: string | number | boolean
}
interface GetURLArgs {
  endpoint: string
  params?: object
}