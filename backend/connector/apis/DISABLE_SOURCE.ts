import type { ServerConector } from 'connector/Server'

const DISABLE_SOURCE = (server: ServerConector): Sources.DisableMethod => id => server.send({
  endpoint: `sources/${id}`,
  method: 'delete'
})

export { DISABLE_SOURCE }