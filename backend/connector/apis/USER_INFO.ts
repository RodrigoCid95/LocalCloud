import type { ServerConector } from 'connector/Server'

const USER_INFO = (server: ServerConector): Users.InfoMethod => uuid => server.send({
  endpoint: `users/${uuid}`,
  method: 'get'
})

export { USER_INFO }