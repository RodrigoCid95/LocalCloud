import type { ServerConector } from 'connector/Server'

const ACCESS_USER_FILE_LIST = (server: ServerConector): FS.UserLsMethod => path => server.send({
  endpoint: 'fs/user/list',
  method: 'post',
  data: { path }
})

export { ACCESS_USER_FILE_LIST }