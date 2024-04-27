import type { ServerConector } from 'connector/Server'

const REMOVE_USER_FILES_AND_DIRECTORIES = (server: ServerConector): FS.UserRmMethod => path => server.send({
  endpoint: 'fs/user',
  method: 'delete',
  data: { path }
})

export { REMOVE_USER_FILES_AND_DIRECTORIES }