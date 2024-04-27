import type { ServerConector } from 'connector/Server'

const ENABLE_SOURCE = (server: ServerConector): Sources.EnableMethod => id => server.send({
  endpoint: `sources/${id}`,
  method: 'post'
})

export { ENABLE_SOURCE }