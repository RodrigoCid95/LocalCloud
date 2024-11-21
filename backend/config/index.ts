import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import ini from 'ini'
import { Store } from 'express-session'
import compression from 'compression'
import session from 'express-session'
import cors from 'cors'
import { Liquid } from 'liquidjs'

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

const srcPath = CONFIG.server.connector

const samba = path.resolve(CONFIG.system.samba)
const shadow = path.resolve(CONFIG.system.shadow)
const passwd = path.resolve(CONFIG.system.passwd)
const group = path.resolve(CONFIG.system.group)
const apps = path.resolve(CONFIG.server.apps)
const views = path.resolve(CONFIG.server.views)
const storages = path.resolve(CONFIG.server.storages)
const shared = path.resolve(CONFIG.fs.shared)
const home = path.resolve(CONFIG.fs.home)
const recycleBin = path.resolve(CONFIG.fs['recycle bin'])
if (!fs.existsSync(samba)) {
  const baseDir = path.dirname(samba)
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  fs.writeFileSync(samba, '', 'utf-8')
}
if (!fs.existsSync(shadow)) {
  const baseDir = path.dirname(shadow)
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  fs.writeFileSync(shadow, '', 'utf-8')
}
if (!fs.existsSync(passwd)) {
  const baseDir = path.dirname(passwd)
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  fs.writeFileSync(passwd, '', 'utf-8')
}
if (!fs.existsSync(group)) {
  const baseDir = path.dirname(group)
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  fs.writeFileSync(group, '', 'utf-8')
}
if (!fs.existsSync(apps)) {
  fs.mkdirSync(path.join(apps, 'temp'), { recursive: true })
}
if (!fs.existsSync(views)) {
  fs.mkdirSync(views, { recursive: true })
}
if (!fs.existsSync(storages)) {
  fs.mkdirSync(storages, { recursive: true })
}
if (!fs.existsSync(shared)) {
  fs.mkdirSync(shared, { recursive: true })
}
if (!fs.existsSync(home)) {
  fs.mkdirSync(home, { recursive: true })
}
if (!fs.existsSync(recycleBin)) {
  fs.mkdirSync(recycleBin, { recursive: true })
}

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

const middlewares = [
  compression(),
  session({
    store: new SessionStore(),
    secret: fs.readFileSync(keyPath, 'utf-8'),
    resave: false,
    saveUninitialized: true
  })
]

if (!IS_RELEASE || getFlag('maintenance-mode')) {
  middlewares.push(cors())
}

export const database: Database.Config = {
  path: path.resolve(CONFIG.server['data base'])
}

export const devMode: DevMode.Config = {
  enable: getFlag('maintenance-mode') as boolean,
  user: getFlag('user') as string
}

export const builderConnector: BuilderConnector.Config = {
  mainPath: path.join(srcPath, 'main.ts'),
  apiPath: path.join(srcPath, 'apis.ts')
}

export const paths: Paths.Config = {
  samba,
  shadow,
  passwd,
  group,
  system: {
    apps,
    appsViews: path.join(views, 'apps'),
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