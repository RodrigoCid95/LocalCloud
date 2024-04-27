import type { ServerConector } from 'connector/Server'

const SHARED_DELETE = (server: ServerConector): Shared.DeleteMethod => id => server.send({
  endpoint: `shared/${id}`,
  method: 'delete',
})

export { SHARED_DELETE }