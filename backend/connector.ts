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
    const url = new URL(['api', endpoint].join('/'), IS_DEV ? import.meta.resolve('./..') : location.origin)
    this.#xhr.open('POST', url, true)
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
  createUploader = ({ path, file, metadata }: CreateUploaderArgs) => new FileUploader(this.createURL({ path: ['api', ...path] }).href, file, metadata)
  #launch = (...path: string[]) => window.open(this.createURL({ path }).href, undefined, 'popup,noopener,noopener')
  launchFile = (base: 'shared' | 'user', ...path: string[]) => this.#launch(this.createURL({ path: ['launch', base, ...path] }).href)
  launchApp = (package_name: string, params: URLParams) => this.#launch(this.createURL({ path: ['app', package_name], params }).href)
  async send<R = Object>({ endpoint, method, params, data: body }: SendArgs): Promise<R> {
    const url = this.createURL({ path: ['api', endpoint], params }).href
    const headers: Headers = new Headers()
    headers.append('token', TOKEN)
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      let response: Response
      if (method === 'get') {
        response = await fetch(
          url,
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
          url,
          {
            method,
            headers,
            body
          }
        )
      }
      return response.json()
    } else {
      throw new Error(`El método ${method} no es válido, utiliza 'get', 'post', 'put' o 'delete'.`)
    }
  }
  createURL({ path = [], params = {} }: CreateURLArgs): URL {
    const url = new URL(path.join('/'), IS_DEV ? import.meta.resolve('./..') : location.origin)
    const keys = Object.keys(params)
    for (const key of keys) {
      url.searchParams.append(key, params[key])
    }
    return url
  }
}

interface URLParams {
  [key: string]: string
}

interface SendArgs {
  endpoint: string
  method: 'get' | 'post' | 'put' | 'delete'
  params?: URLParams
  data?: string
}

interface CreateURLArgs {
  path: string[]
  params?: URLParams
}

interface CreateUploaderArgs {
  path: string[]
  file: FileOptions
  metadata?: MetaData
}

interface FileOptions {
  name: string
  file: File
}

interface MetaData {
  [x: string]: string
}