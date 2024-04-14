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

class FileUploader implements FileTransfer {
  #xhr: XMLHttpRequest
  #form: FormData
  #listenerLoadList: any[] = []
  #listenerProgressList: any[] = []
  constructor(endpoint: string, files: FileOptions[] = [], metadata: MetaData = {}) {
    this.#xhr = new XMLHttpRequest()
    this.#form = new FormData()
    for (const { name, file } of files) {
      this.#form.append(name, file)
    }
    const meta = Object.entries(metadata)
    for (const [name, value] of meta) {
      this.#form.append(name, value)
    }
    this.#xhr.addEventListener('load', () => {
      const isJSON = this.#xhr.getResponseHeader('content-type')?.includes('application/json')
      const response = isJSON ? JSON.parse(this.#xhr.response) : this.#xhr.response
      for (const listener of this.#listenerLoadList) {
        listener(response)
      }
    })
    this.#xhr.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        for (const listener of this.#listenerProgressList) {
          listener(percentComplete)
        }
      }
    })
    this.#xhr.open('PUT', endpoint, true)
    this.#xhr.setRequestHeader('token', TOKEN)
  }
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    if (event === 'end') {
      this.#listenerLoadList.push(callback)
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
    if (event === 'progress') {
      this.#listenerProgressList.push(callback)
    }
  }
  off(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    if (event === 'end') {
      this.#listenerLoadList = this.#listenerLoadList.filter(listener => listener !== callback)
      return
    }
    if (event === 'abort') {
      this.#xhr.removeEventListener('abort', callback)
      return
    }
    if (event === 'error') {
      this.#xhr.removeEventListener('error', callback)
      return
    }
    this.#listenerProgressList = this.#listenerProgressList.filter(listener => listener !== callback)
  }
  start = () => this.#xhr.send(this.#form)
  cancel = () => this.#xhr.abort()
}

class FileDownloader implements FileTransfer {
  #abortController: AbortController
  #listeners = {
    progress: [],
    end: [],
    error: [],
    abort: []
  }
  constructor(private endpoint: string, private filename: string) {
    this.#abortController = new AbortController()
    this.#abortController.signal.addEventListener('abort', () => {
      for (const listener of this.#listeners.abort) {
        (listener as any)()
      }
    })
  }
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    (this.#listeners[event] as any).push(callback)
  }
  off(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    this.#listeners[event] = this.#listeners[event].filter(listener => listener !== callback)
  }
  start() {
    fetch(this.endpoint, { signal: this.#abortController.signal })
      .then(async response => {
        const reader = response.body?.getReader()
        if (reader) {
          const contentLength: number = parseInt(response.headers.get('content-length') || '0')
          let receivedLength = 0
          const chunks: Uint8Array[] = []
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }
            chunks.push(value)
            receivedLength += value.length
            const percent = (receivedLength / contentLength) * 100
            for (const listener of this.#listeners.progress) {
              (listener as any)(percent.toFixed(2))
            }
          }
          const chunksAll = new Uint8Array(receivedLength)
          let position = 0
          for (const chunk of chunks) {
            chunksAll.set(chunk, position)
            position += chunk.length
          }
          const blob = new Blob([chunksAll])
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = this.filename
          anchor.click()
        }
        for (const listener of this.#listeners.end) {
          (listener as any)()
        }
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        for (const listener of this.#listeners.error) {
          (listener as any)()
        }
      })
  }
  cancel = () => this.#abortController.abort()
}

export class ServerConector {
  createUploader = ({ path, file, metadata }: CreateUploaderArgs) => {
    const base = path.shift() || ''
    return new FileUploader(
      this.createURL({ path: ['api', 'fs', base] }).href,
      Array.isArray(file) ? file : [file],
      { ...metadata, path: path.join('|') }
    )
  }
  createDownloader = (...path: string[]) => new FileDownloader(this.createURL({ path: ['api', 'fs', ...path], params: { download: true } }).href, path[path.length - 1])
  #launch = (url: string) => window.open(url, undefined, 'popup,noopener,noopener')
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
    const entries = Object.entries(params)
    for (const [name, value] of entries) {
      if (typeof value === 'string') {
        url.searchParams.append(name, value)
      }
      if (typeof value === 'number') {
        url.searchParams.append(name, value.toString())
      }
      if (typeof value === 'boolean') {
        url.searchParams.append(name, '')
      }
    }
    return url
  }
}

interface FileTransfer {
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
  off(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
  start(): void
  cancel(): void
}

interface URLParams {
  [key: string]: string | number | boolean
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
  file: FileOptions | FileOptions[]
  metadata?: MetaData
}

interface FileOptions {
  name: string
  file: File
}

interface MetaData {
  [x: string]: string
}

Object.defineProperty(window, 'token', { value: TOKEN, writable: false })