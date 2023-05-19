import { Callback, IServerConnector, SendArguments } from 'builder/types/server'
import { io, Socket } from 'socket.io-client'

export class ServerConnectorClass implements IServerConnector {
  public socket: Socket
  constructor() {
    this.socket = io()
  }
  onConnect(callback: () => void | Promise<void>): void {
    this.socket.on('connect', callback)
  }
  send<T = null>(args: SendArguments): Promise<T> {
    throw new Error('Method not implemented.');
  }
  emit<T = null>(event: string, data?: object): Promise<T> {
    throw new Error('Method not implemented.');
  }
  on<T = {}>(event: string, callback: Callback<T>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}