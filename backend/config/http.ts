import crypto from 'node:crypto'
import session from 'express-session'
import RedisStore from 'connect-redis'
import { createClient } from 'redis'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import cors from 'cors'
import { paths } from './paths'

declare const isRelease: boolean
declare const flags: PXIO.Flags

const redisClient = createClient()

const middlewares = [
  compression(),
  session({
    store: new RedisStore({ client: redisClient }),
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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