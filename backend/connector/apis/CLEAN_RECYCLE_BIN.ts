import type { ServerConector } from 'connector/Server'

const CLEAN_RECYCLE_BIN = (server: ServerConector): RecycleBin.CleanMethod => () => server.send({
  endpoint: 'recycle-bin',
  method: 'delete'
})

export { CLEAN_RECYCLE_BIN }