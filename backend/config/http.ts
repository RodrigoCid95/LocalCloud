import session from 'express-session'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import { v4 } from 'uuid'
import cors from 'cors'
import { paths } from './paths'

declare const isRelease: boolean

const middlewares = [
  compression(),
  session({
    saveUninitialized: false,
    resave: false,
    secret: v4()
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