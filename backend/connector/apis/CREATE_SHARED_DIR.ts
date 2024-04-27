import type { ServerConector } from 'connector/Server'

const CREATE_SHARED_DIR = (server: ServerConector): FS.SharedMkdirMethod => path => server.send({
  endpoint: 'fs/shared',
  method: 'post',
  data: { path }
})

export { CREATE_SHARED_DIR }