import { BitisHTTPConfigProfile } from 'bitis/http'
import { BitisSocketsConfig } from 'bitis/web-sockets'
import { CipherClass } from 'types/Cipher'

export const bitisHttpConfig: BitisHTTPConfigProfile = {
  pathsPublic: [
    {
      route: '/',
      dir: 'public'
    }
  ]
}

export const bitisSocketsConfig: BitisSocketsConfig = {
  events: {
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