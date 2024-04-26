import type { ServerConector } from 'connector/Server'

const AUTH_LOGIN = (server: ServerConector): Auth.LoginMethod => (credentials: Auth.Credentials) => server.send<Auth.LoginOkResult | Auth.LoginFailResult>({
  method: 'post',
  endpoint: 'auth',
  data: credentials
})

export { AUTH_LOGIN }