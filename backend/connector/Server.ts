import { encrypting } from './Encrypting'
import { FileDownloader } from './FileDownloader'
import { FileUploader } from './FileUploader'

declare const TOKEN: string
declare const IS_DEV: boolean

export class ServerConector {
  createUploader = ({ api = 'fs', path = [], file, metadata = {} }: CreateUploaderArgs) => {
    const base = path.shift() || ''
    return new FileUploader(
      this.createURL({ path: ['api', api, base] }).href,
      Array.isArray(file) ? file : [file],
      { ...metadata, path: path.join('|') }
    )
  }
  createDownloader = (path: string[]) => new FileDownloader(this.createURL({ path: ['file', ...path], params: { download: true } }).href, path[path.length - 1])
  #launch = (url: string) => window.open(url, undefined, 'popup,noopener,noopener')
  launchFile = (base: 'shared' | 'user', ...path: string[]) => this.#launch(this.createURL({ path: ['launch', base, ...path] }).href)
  launchApp = (package_name: string, params: URLParams) => this.#launch(this.createURL({ path: ['app', package_name], params }).href)
  async send<R = Object>({ endpoint, method, params, data }: SendArgs): Promise<R> {
    let body = JSON.stringify(data)
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
    const baseURL = new URL(import.meta.url)
    const url = new URL(path.join('/'), baseURL.origin)
    const entries = Object.entries(params)
    for (const [name, value] of entries) {
      if (typeof value === 'string') {
        url.searchParams.append(name, value)
      }
      if (typeof value === 'number') {
        url.searchParams.append(name, value.toString())
      }
      if (typeof value === 'boolean') {
        url.searchParams.append(name, value ? 'true' : 'false')
      }
    }
    return url
  }
}