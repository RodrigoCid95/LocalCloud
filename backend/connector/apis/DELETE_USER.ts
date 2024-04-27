import type { ServerConector } from 'connector/Server'

const DELETE_USER = (server: ServerConector): Users.DeleteMethod => uuid => server.send({
  endpoint: `users/${uuid}`,
  method: 'delete'
})

export { DELETE_USER }