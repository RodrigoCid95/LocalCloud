import { io, Socket } from 'socket.io-client'
import { Cipher } from './Cipher'

const __SOCKET__ = Symbol()
const __CIPHER__ = Symbol()
export default class Server {
  [__SOCKET__]: Socket
  [__CIPHER__]: Cipher
  constructor() {
    this[__SOCKET__] = io()
    this[__SOCKET__].on('disconnect', () => window.location.reload())
    this[__CIPHER__] = new Cipher()
  }
  public onConnect(callback: () => void | Promise<void>) {
    this[__SOCKET__].on('connect', callback)
  }
  public async send<T = null>(args: SendArguments): Promise<T> {
    const { path, method, data, encryptRequest, decryptResponse } = args
    let response = undefined
    if (data) {
      const headers = new Headers()
      headers.append("Content-Type", "application/json")
      let body = JSON.stringify(data)
      if (encryptRequest) {
        body = JSON.stringify({ dataEncrypt: await this[__CIPHER__].encrypt(this[__SOCKET__].id, body) })
      }
      response = fetch(path, { method, headers, body }).then(res => res.text())
    } else {
      response = fetch(path, { method }).then(res => res.text())
    }
    if (response && decryptResponse) {
      response = this[__CIPHER__].decrypt(this[__SOCKET__].id, response)
    }
    return response
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

export type SendArguments = {
  path: string
  method: Methods
  data?: any
  encryptRequest?: boolean
  decryptResponse?: boolean
}

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}