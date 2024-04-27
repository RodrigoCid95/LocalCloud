import type { ServerConector } from 'connector/Server'

const SHARED_CREATE = (server: ServerConector): Shared.CreateMethod => path => server.send({
  endpoint: 'shared',
  method: 'post',
  data: { path }
})

export { SHARED_CREATE }