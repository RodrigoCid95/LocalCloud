import type { ServerConector } from 'connector/Server'

const SHARED_LIST = (server: ServerConector): Shared.ListMethod => () => server.send({
  endpoint: 'shared',
  method: 'get'
})

export { SHARED_LIST }