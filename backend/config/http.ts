import crypto from 'node:crypto'
import fs from 'node:fs'
import session from 'express-session'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import cors from 'cors'
import { paths } from './paths'
import { Store } from 'express-session'

class SessionConnector {
  #CALLBACKS: {
    [x: string]: any
  }
  constructor() {
    this.#CALLBACKS = {}
    process.on('message', message => {
      const { uid, data } = message as any
      this.#CALLBACKS[uid](data)
      delete this.#CALLBACKS[uid]
    })
  }
  async emit(event: string, ...args: any[]) {
    const uid = crypto.randomUUID()
    return new Promise(resolve => {
      this.#CALLBACKS[uid] = (data: any) => resolve(data)
      if (process.send) {
        process.send({ uid, event, args })
      }
    })
  }
}

export class SessionStore extends Store {
  connector: SessionConnector
  constructor() {
    super()
    this.connector = new SessionConnector()
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
      .emit('length')
      .then((data: any) => callback(null, data))
  }
  clear(callback: (arg0: null) => void) {
    this
      .connector
      .emit('clear')
      .then(callback)
  }
}

if (!fs.existsSync('./key.pem')) {
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    }
  })
  fs.writeFileSync('./key.pem', privateKey, 'utf-8')
}

const middlewares = [
  compression(),
  session({
    store: new SessionStore(),
    secret: fs.readFileSync('./key.pem', 'utf-8'),
    resave: false,
    saveUninitialized: true
  })
]

if (!isRelease || flags.get('maintenance-mode')) {
  middlewares.push(cors())
}

export const HTTP: PXIOHTTP.Config = {
  optionsUrlencoded: { extended: true },
  engineTemplates: {
    name: 'liquid',
    ext: 'liquid',
    callback: (new Liquid({
      layouts: paths.system.clientViews,
      extname: 'liquid'
    })).express(),
    dirViews: paths.system.clientViews
  },
  middlewares,
  events: {
    onError(err, req, res, next) {
      if (err) {
        res.status(500).json(err)
      } else {
        next()
      }
    }
  },
  pathsPublic: [
    {
      route: '/',
      dir: paths.system.clientPublic
    }
  ]
}