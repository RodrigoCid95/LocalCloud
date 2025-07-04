import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { Liquid } from "liquidjs"
import session from 'express-session'
import compression from 'compression'
import { createAdapter } from '@socket.io/cluster-adapter'
import { setupWorker } from '@socket.io/sticky'
import { SessionStore } from './SessionStore'

const shareDir = path.resolve('/', 'usr', 'share', 'local-cloud')
const keyPath = path.join(shareDir, 'key.pem')
if (!fs.existsSync(keyPath)) {
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
  fs.writeFileSync(keyPath, privateKey, 'utf-8')
}
const viewsPath = path.join(shareDir, 'views')
const sessionModdleware = session({
  store: new SessionStore(),
  secret: fs.readFileSync(keyPath, 'utf-8'),
  resave: true,
  saveUninitialized: true
})
const timeoutMiddleware: PXIOHTTP.Middleware = (req, _, next: Next) => {
  req?.setTimeout(0)
  next()
}
const middlewares = [
  timeoutMiddleware,
  compression(),
  sessionModdleware
]

export const HTTP: PXIOHTTP.Config = {
  optionsUrlencoded: { extended: true },
  engineTemplates: {
    name: 'liquid',
    ext: 'liquid',
    callback: (new Liquid({
      layouts: viewsPath,
      extname: 'liquid'
    })).express(),
    dirViews: viewsPath
  },
  middlewares,
  events: {
    onError(err, _, res, next) {
      if (err) {
        console.error(err)
        if (!res.closed) {
          res.status(500).json(err)
        }
      } else {
        next()
      }
    }
  },
  pathsPublic: [
    {
      route: '/',
      dir: path.join(shareDir, 'public')
    }
  ]
}

export const WS: PXIOSockets.Config = {
  events: {
    onBeforeConfig(io) {
      io.adapter(createAdapter())
      io.engine.use(sessionModdleware)
      setupWorker(io)
    }
  }
}