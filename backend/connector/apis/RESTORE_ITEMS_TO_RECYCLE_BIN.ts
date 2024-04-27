import type { ServerConector } from 'connector/Server'

const RESTORE_ITEMS_TO_RECYCLE_BIN = (server: ServerConector): RecycleBin.RestoreMethod => id => server.send({
  endpoint: `recycle-bin/${id}`,
  method: 'put'
})

export { RESTORE_ITEMS_TO_RECYCLE_BIN }