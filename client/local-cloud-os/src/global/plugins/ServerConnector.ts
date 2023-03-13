import { ICapacitor } from 'types/capacitor'
import { Callback, IServerConnector, SendArguments, Response } from 'types/server'
import { Build } from '@stencil/core'
import { WebPlugin } from '@capacitor/core'
import { Socket, Manager } from 'socket.io-client'

declare const Capacitor: ICapacitor

export class ServerConnector extends WebPlugin implements IServerConnector {
  private socket: Socket
  constructor() {
    super()
    const manager = new Manager(Build.isDev ? 'http://localhost:3001' : location.origin)
    this.socket = manager.socket('/')
  }
  async onConnect(callback: () => void | Promise<void>): Promise<void> {
    this.socket.on('connect', callback)
  }
  async send<T = null>(args: SendArguments): Promise<T> {
    const { path, method, data, encryptRequest, decryptResponse } = args
    let response = undefined
    if (data) {
      const headers = new Headers()
      headers.append("Content-Type", "application/json")
      let body = JSON.stringify(data)
      if (encryptRequest) {
        body = JSON.stringify({ dataEncrypt: await Capacitor.Plugins.Cipher.encrypt(this.socket.id, body) })
      }
      response = fetch(path, { method, headers, body }).then(res => res.text())
    } else {
      response = fetch(path, { method }).then(res => res.text())
    }
    if (response && decryptResponse) {
      response = Capacitor.Plugins.Cipher.decrypt(this.socket.id, response)
    }
    return response
  }
  async emit<T = null>(event: string, data?: object): Promise<T> {
    let response: string = ''
    if (data) {
      const request = Capacitor.Plugins.Cipher.isEnable() ? { request: await Capacitor.Plugins.Cipher.encrypt(this.socket.id, JSON.stringify(data)) } : data
      response = await new Promise(resolve => this.socket.emit(event, request, resolve))
    } else {
      response = await new Promise(resolve => this.socket.emit(event, resolve))
    }
    const result = Capacitor.Plugins.Cipher.isEnable() ? JSON.parse(await Capacitor.Plugins.Cipher.decrypt(this.socket.id, response)) : response
    const { data: dataResult, error }: Response<T> = result
    if (typeof dataResult !== 'undefined') {
      return dataResult
    }
    if (error) {
      throw error
    }
  }
  async on<T = {}>(event: string, callback: Callback<T>): Promise<void> {
    this.socket.on(event, async (response: any) => {
      if (Capacitor.Plugins.Cipher.isEnable()) {
        const result = await Capacitor.Plugins.Cipher.decrypt(this.socket.id, response)
        const res = JSON.parse(result)
        callback(res)
      } else {
        callback(response)
      }
    })
  }
}
