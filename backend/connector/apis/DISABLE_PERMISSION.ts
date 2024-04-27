import type { ServerConector } from 'connector/Server'

const DISABLE_PERMISSION = (server: ServerConector): Permissions.DisableMethod => id => server.send({
  endpoint: `permissions/${id}`,
  method: 'delete'
})

export { DISABLE_PERMISSION }