import type { ServerConector } from 'connector/Server'

const UPDATE_USER_INFO = (server: ServerConector): Users.UpdateMethod => (uuid, data) => server.send({
  endpoint: `users/${uuid}`,
  method: 'put',
  data
})

export { UPDATE_USER_INFO }