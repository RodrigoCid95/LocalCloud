import type { ServerConector } from 'connector/Server'

const AUTH_LOGOUT = (server: ServerConector): Auth.LogOutMethod => () => server.send({
  endpoint: 'auth',
  method: 'delete'
})

export { AUTH_LOGOUT }