import type { PhoenixHTTPConfigProfile } from "phoenix-js/http"
import path from 'node:path'
import session from 'express-session'
import compression from 'compression'
import { Liquid } from 'liquidjs'
import { v4 } from 'uuid'

export const phoenixHttpConfig: PhoenixHTTPConfigProfile = {
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
  middlewares: [
    compression(),
    session({
      saveUninitialized: false,
      resave: false,
      secret: v4()
    })
  ],
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
      dir: path.resolve(__dirname, '..', '..', 'public')
    },
    {
      route: '/app',
      dir: path.resolve(__dirname, '..', '..', 'public')
    }
  ]
}