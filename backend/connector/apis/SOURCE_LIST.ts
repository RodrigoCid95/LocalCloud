import type { ServerConector } from 'connector/Server'

const SOURCE_LIST = (server: ServerConector): Sources.FindMethod => params => server.send({
  endpoint: 'sources',
  method: 'get',
  params
})

export { SOURCE_LIST }