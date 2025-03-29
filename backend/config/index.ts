import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import ini from 'ini'
import compression from 'compression'
import session from 'express-session'
import cors from 'cors'
import { Liquid } from 'liquidjs'
import { SessionStore } from './SessionStore'
import { getPaths } from './paths'
import { createAdapter } from '@socket.io/cluster-adapter'
import { setupWorker } from '@socket.io/sticky'

const end = () => {
  console.error('Config not found.')
  process.exit(1)
}

if (process.env.CONFIG) {
  if (!fs.existsSync(process.env.CONFIG)) {
    end()
  }
} else {
  end()
}
const strConfig = fs.readFileSync(process.env.CONFIG as string, 'utf-8')
const CONFIG = ini.parse(strConfig)

const iniPaths = getPaths(CONFIG)
const {
  samba,
  shadow,
  passwd,
  group,
  apps,
  views,
  storages,
  shared,
  home,
  recycleBin,
  mainPath,
  apiPath,
  appsViews,
  dataBase: dataBasePath
} = iniPaths

const keyPath = path.resolve(CONFIG.server.key)
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

const sessionModdleware = session({
  store: new SessionStore(),
  secret: fs.readFileSync(keyPath, 'utf-8'),
  resave: true,
  saveUninitialized: true
})
const middlewares = [
  compression(),
  sessionModdleware
]

if (!IS_RELEASE || getFlag('maintenance-mode')) {
  middlewares.push(cors())
}

export const database: Database.Config = { path: dataBasePath }

export const devMode: DevMode.Config = {
  enable: getFlag('maintenance-mode') as boolean,
  user: getFlag('user') as string
}

export const builderConnector: BuilderConnector.Config = { mainPath, apiPath }

export const paths: Paths.Config = {
  samba,
  shadow,
  passwd,
  group,
  system: {
    apps,
    appsViews,
    storages,
    database: database.path,
    clientPublic: CONFIG.server.public,
    clientViews: views,
  },
  users: {
    shared,
    path: home,
    recycleBin
  }
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

export const isRelease = IS_RELEASE
export const WS: PXIOSockets.Config = {
  events: {
    onBeforeConfig(io) {
      io.adapter(createAdapter())
      io.engine.use(sessionModdleware)
      setupWorker(io)
    }
  }
}