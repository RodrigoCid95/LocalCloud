import type { ServerConector } from 'connector/Server'

const ENABLE_PERMISSION = (server: ServerConector): Permissions.EnableMethod => id => server.send({
  endpoint: `permissions/${id}`,
  method: 'post'
})

export { ENABLE_PERMISSION }