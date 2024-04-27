import type { ServerConector } from 'connector/Server'

const ACCESS_SHARED_FILE_LIST = (server: ServerConector): FS.SharedLsMethod => path => server.send({
  endpoint: 'fs/shared/list',
  method: 'post',
  data: { path }
})

export { ACCESS_SHARED_FILE_LIST }