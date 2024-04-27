import type { ServerConector } from 'connector/Server'

const LIST_RECYCLE_BIN = (server: ServerConector): RecycleBin.ListMethod => () => server.send({
  endpoint: 'recycle-bin',
  method: 'get'
})

export { LIST_RECYCLE_BIN }