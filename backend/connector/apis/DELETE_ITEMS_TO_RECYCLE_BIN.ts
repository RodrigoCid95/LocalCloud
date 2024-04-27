import type { ServerConector } from 'connector/Server'

const DELETE_ITEMS_TO_RECYCLE_BIN = (server: ServerConector): RecycleBin.DeleteMethod => id => server.send({
  endpoint: `recycle-bin/${id}`,
  method: 'delete'
})

export { DELETE_ITEMS_TO_RECYCLE_BIN }