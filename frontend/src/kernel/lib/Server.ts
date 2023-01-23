import { io, Socket } from 'socket.io-client'

export default class Server {
  public socket: Socket
  constructor() {
    this.socket = io()
  }
}