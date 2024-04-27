import type { ServerConector } from 'connector/Server'

const AUTH_LOGIN = (server: ServerConector): Auth.LoginMethod => credentials => server.send({
  method: 'post',
  endpoint: 'auth',
  data: credentials
})

export { AUTH_LOGIN }