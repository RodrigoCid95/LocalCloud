import type { ServerConector } from 'connector/Server'

const AUTH_STATUS = (server: ServerConector): Auth.StatusMethod => () => server.send<boolean>({
  endpoint: 'auth',
  method: 'get'
})

export { AUTH_STATUS }