import { CipherClass } from 'types/Cipher'
import path from 'path'
import fs from 'fs'
import { Flags } from 'bitis/core'
import { BitisHTTPConfigProfile } from 'bitis/http'
import { BitisSocketsConfig, Socket } from 'bitis/web-sockets'
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
const appsDir = path.join(baseDir, 'apps')
if (!fs.existsSync(appsDir)) {
  fs.mkdirSync(appsDir, { recursive: true })
}
const sessionMiddleware = session({ secret: v4(), saveUninitialized: true, resave: true })

export const bitisHttpConfig: BitisHTTPConfigProfile = {
  middlewares: [fileUpload(), sessionMiddleware],
  pathsPublic: [{ route: '/', dir: 'public' }]
}

export const bitisSocketsConfig: BitisSocketsConfig = {
  events: {
    onConnect(socket: Socket) {
      const req: any = socket.request
      req.session.socketID = socket.id
      req.session.save()
      socket.use((__, next) => req.session.reload(err => err ? socket.disconnect() : next()))
    },
    onBeforeConfig(io) {
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

export const appsManager = { baseDir }