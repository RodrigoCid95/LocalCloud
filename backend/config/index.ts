import { CipherClass } from 'types/Cipher'
import path from 'path'
import os from 'os'
import fileUpload from 'express-fileupload'
import { BitisHTTPConfigProfile } from 'bitis/http'
import { BitisSocketsConfig, Socket } from 'bitis/web-sockets'
import session from 'express-session'
import { v4 } from 'uuid'

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
      if (request[0] && typeof request[0] === 'object' && request[0].request) {
        const cipher = getLibraryInstance<CipherClass>('cipher')
        const data = await cipher.decrypt(socket.id, request[0].request)
        request[0] = data
      }
      return request
    },
    async onBeforeToAnswer(response, socket, getLibraryInstance) {
      const cipher = getLibraryInstance<CipherClass>('cipher')
      return await cipher.encrypt(socket.id, JSON.stringify(response))
    }
  }
}

const usersPath = path.resolve(os.homedir(), 'users')

export const fileSystem = { usersPath }

export const appsManager = { usersPath }