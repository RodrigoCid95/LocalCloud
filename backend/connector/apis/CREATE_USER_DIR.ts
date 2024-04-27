import type { ServerConector } from 'connector/Server'

const CREATE_USER_DIR = (server: ServerConector): FS.UserMkdirMethod => path => server.send({
  endpoint: 'fs/user',
  method: 'post',
  data: { path }
})

export { CREATE_USER_DIR }