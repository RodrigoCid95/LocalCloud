import type { ServerConector } from 'connector/Server'

const REMOVE_SHARED_FILES_AND_DIRECTORIES = (server: ServerConector): FS.SharedRmMethod => path => server.send({
  endpoint: 'fs/shared',
  method: 'delete',
  data: { path }
})

export { REMOVE_SHARED_FILES_AND_DIRECTORIES }