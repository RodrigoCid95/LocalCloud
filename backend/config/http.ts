import compression from 'compression'
import { Liquid } from 'liquidjs'
import cors from 'cors'
import { paths } from './paths'
import session from "express-session"
import MongoStore from "connect-mongo"
import { keys } from './keys'

declare const isRelease: boolean
declare const flags: PXIO.Flags

const middlewares = [
  compression(),
  session({
    store: MongoStore.create({
      mongoUrl: `mongodb://lc:${keys.password}@localhost:27017`,
      dbName: '_lc'
    }),
    resave: false,
    saveUninitialized: false,
    secret: keys.secret,
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