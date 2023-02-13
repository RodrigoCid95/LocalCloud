import { io, Socket } from 'socket.io-client'
import { Cipher } from './Cipher'

const __SOCKET__ = Symbol()
const __CIPHER__ = Symbol()
export default class Server {
  [__SOCKET__]: Socket
  [__CIPHER__]: Cipher
  constructor() {
    this[__SOCKET__] = io()
    this[__CIPHER__] = new Cipher()
  }
  public onConnect(callback: () => void | Promise<void>) {
    this[__SOCKET__].on('connect', callback)
  }
  public send<D = {}>(args: Omit<SendArguments<D>, 'onProgress'>): () => void {
    const { path, method, data, onAbort, onError, onLoad, onLoadend, onLoadstart, onTimeout } = args
    const xhr = new XMLHttpRequest()
    if (onAbort) {
      xhr.addEventListener('abort', onAbort)
    }
    if (onError) {
      xhr.addEventListener('error', onError)
    }
    if (onLoad) {
      xhr.addEventListener('load', onLoad)
    }
    if (onLoadend) {
      xhr.addEventListener('loadend', onLoadend)
    }
    if (onLoadstart) {
      xhr.addEventListener('loadstart', onLoadstart)
    }
    if (onTimeout) {
      xhr.addEventListener('timeout', onTimeout)
    }
    xhr.open(method, path)
    xhr.setRequestHeader("Content-Type", "application/json")
    if (data) {
      xhr.send(JSON.stringify(data))
    } else {
      xhr.send()
    }
    return xhr.abort
  }
  public async emit<T = {}>(event: string, data?: object): Promise<T> {
    let response: string = ''
    if (data) {
      let strData = JSON.stringify(data)
      const request = await this[__CIPHER__].encrypt(this[__SOCKET__].id, strData)
      response = await new Promise(resolve => this[__SOCKET__].emit(event, { request }, resolve))
    } else {
      response = await new Promise(resolve => this[__SOCKET__].emit(event, resolve))
    }
    const result = await this[__CIPHER__].decrypt(this[__SOCKET__].id, response)
    const res = JSON.parse(result)
    const { data: dataResult, error }: Response<T> = res
    if (typeof dataResult !== 'undefined') {
      return dataResult
    }
    if (error) {
      throw error
    }
  }
  public on<T = {}>(event: string, callback: Callback<T>) {
    this[__SOCKET__].on(event, async (response: string) => {
      const result = await this[__CIPHER__].decrypt(this[__SOCKET__].id, response)
      const res = JSON.parse(result)
      callback(res)
    })
  }
}

type Callback<T> = (response: T) => void | Promise<void>

type Response<T> = {
  data: T
  error: {
    message: string
    stack: string
  }
}

export type SendArguments<D> = {
  path: string
  method: Methods
  data?: D
  onAbort?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
  onError?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
  onLoad?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
  onLoadend?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
  onLoadstart?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
  onProgress?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
  onTimeout?: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => void
}

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}