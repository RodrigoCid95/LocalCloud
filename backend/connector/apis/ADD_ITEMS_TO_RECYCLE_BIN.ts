import type { ServerConector } from 'connector/Server'

const ADD_ITEMS_TO_RECYCLE_BIN = (server: ServerConector): RecycleBin.AddMethod => path => server.send({
  endpoint: 'recycle-bin',
  method: 'post',
  data: { path }
})

export { ADD_ITEMS_TO_RECYCLE_BIN }