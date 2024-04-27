import type { ServerConector } from 'connector/Server'

const CREATE_USER = (server: ServerConector): Users.CreateMethod => newUser => server.send({
  endpoint: 'users',
  method: 'post',
  data: newUser
})

export { CREATE_USER }