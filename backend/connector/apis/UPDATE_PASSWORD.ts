import type { ServerConector } from 'connector/Server'

const UPDATE_PASSWORD = (server: ServerConector): Profile.UpdatePasswordMethod => data => server.send({
  endpoint: 'profile',
  method: 'put',
  data
})

export { UPDATE_PASSWORD }