import type { ServerConector } from 'connector/Server'

const USER_LIST = (server: ServerConector): Users.ListMethod => () => server.send({
  endpoint: 'users',
  method: 'get'
})

export { USER_LIST }