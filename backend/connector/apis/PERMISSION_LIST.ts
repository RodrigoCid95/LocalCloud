import type { ServerConector } from 'connector/Server'

const PERMISSION_LIST = (server: ServerConector): Permissions.FindMethod => query => server.send({
  endpoint: 'permissions',
  method: 'get',
  params: { ...query }
})

export { PERMISSION_LIST }