import crypto from 'node:crypto'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import cors from 'cors'
import { paths } from './paths'
import RedisStore from "connect-redis"
import session from "express-session"
import { createClient } from "redis"

declare const isRelease: boolean
declare const flags: PXIO.Flags

const redisClient = createClient()
redisClient.connect().catch(console.error)

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "lc:",
})

const middlewares = [
  compression(),
  session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: crypto.randomUUID(),
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