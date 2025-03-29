import { ThreadConnector } from 'config/ThreadConnector'
import { Store } from 'express-session'

export class SessionStore extends Store {
  connector: ThreadConnector
  constructor() {
    super()
    this.connector = new ThreadConnector('core.sessions')
  }
  get(sid: any, callback: (arg0: null, arg1: any) => void) {
    this
      .connector
      .emit('get', sid)
      .then(session => callback(null, session || null))
  }
  set(sid: any, session: any, callback: (arg0: null) => void) {
    this
      .connector
      .emit('set', sid, session)
      .then(callback)
  }
  destroy(sid: any, callback: (arg0: null) => void) {
    this
      .connector
      .emit('delete', sid)
      .then(callback)
  }
  length(callback: (arg0: null, arg1: number) => void) {
    this
      .connector
      .emit('length')
      .then((data: any) => callback(null, data))
  }
  all(callback: (arg0: null, arg1: any[]) => void) {
    this
      .connector
      .emit('all')
      .then((data: any) => callback(null, data))
  }
  clear(callback: (arg0: null) => void) {
    this
      .connector
      .emit('clear')
      .then(callback)
  }
}