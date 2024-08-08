import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import cors from 'cors'
import { paths } from './paths'
import session from "express-session"
import MongoStore from "connect-mongo"

declare const isRelease: boolean
declare const flags: PXIO.Flags

const KEY_PATH = path.resolve(__dirname, 'key.pem')
let secret: string
if (fs.existsSync(KEY_PATH)) {
  secret = fs.readFileSync(KEY_PATH, 'utf-8')
} else {
  const key = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })
  secret = key.privateKey
  fs.writeFileSync(KEY_PATH, secret, 'utf-8')
}

const middlewares = [
  compression(),
  session({
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost:27017',
      dbName: '_sessions'
    }),
    resave: false,
    saveUninitialized: false,
    secret,
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
    afterConfig(app) {
      app.set('trust proxy', 1)
    },
    onError(err, _, res, next) {
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