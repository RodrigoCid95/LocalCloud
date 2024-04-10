import path from 'node:path'
import session from 'express-session'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import { v4 } from 'uuid'
import { devMode } from './dev-mode'
import cors from 'cors'

const middlewares = [
  compression(),
  session({
    saveUninitialized: false,
    resave: false,
    secret: v4()
  })
]

if (devMode.isDevMode) {
  middlewares.push(cors({
    origin: devMode.cors
  }))
}

export const HTTP: PXIOHTTP.Config = {
  optionsUrlencoded: { extended: true },
  engineTemplates: {
    name: 'liquid',
    ext: 'liquid',
    callback: (new Liquid({
      layouts: path.resolve(__dirname, '..', 'views'),
      extname: 'liquid'
    })).express(),
    dirViews: path.resolve(__dirname, '..', 'views')
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
      dir: path.resolve(__dirname, '..', 'public')
    },
    {
      route: '/app',
      dir: path.resolve(__dirname, '..', 'public')
    }
  ]
}