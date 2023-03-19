import { CipherClass } from 'types/Cipher'
import path from 'path'
import fs from 'fs'
import { Flags } from 'phoenix-js/core'
import { PhoenixHTTPConfigProfile } from 'phoenix-js/http'
import { PhoenixSocketsConfig, Socket } from 'phoenix-js/web-sockets'
import session from 'express-session'
import fileUpload from 'express-fileupload'
import { v4 } from 'uuid'

const flags = new Flags()
const baseDir = path.resolve(__dirname, '..', '..')
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true })
}
const systemDB = path.join(baseDir, 'data.db')
if (!fs.existsSync(systemDB)) {
  fs.writeFileSync(systemDB, '', { encoding: 'utf8' })
}
const sessionMiddleware = session({ secret: v4(), saveUninitialized: true, resave: true })

export const phoenixHttpConfig: PhoenixHTTPConfigProfile = {
  middlewares: [fileUpload(), sessionMiddleware],
  pathsPublic: [{ route: '/', dir: 'public' }]
}

export const phoenixSocketsConfig: PhoenixSocketsConfig = {
  events: {
    onConnect(socket: Socket) {
      const req: any = socket.request
      req.session.socketID = socket.id
      req.session.save()
      socket.use((__, next) => req.session.reload(err => err ? socket.disconnect() : next()))
    },
    onBeforeConfig(io) {
      if (flags.get('prod')) {
        const { createAdapter } = require('@socket.io/cluster-adapter')
        const { setupWorker } = require('@socket.io/sticky')
        io.adapter(createAdapter())
        setupWorker(io)
      }
      const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
      io.use(wrap(sessionMiddleware))
      return io
    },
    async onANewRequest(request, socket, getLibraryInstance) {
      if (!flags.get('no-crypto')) {
        if (request[0] && typeof request[0] === 'object' && request[0].request) {
          const cipher = getLibraryInstance<CipherClass>('cipher')
          const data = await cipher.decrypt(socket.id, request[0].request)
          request[0] = data
        }
        return request
      }
      return request
    },
    async onBeforeToAnswer(response, socket, getLibraryInstance) {
      if (!flags.get('no-crypto')) {
        const cipher = getLibraryInstance<CipherClass>('cipher')
        return await cipher.encrypt(socket.id, JSON.stringify(response))
      }
      return response
    }
  }
}

export const fileSystem = { baseDir }