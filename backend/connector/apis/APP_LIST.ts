import type { ServerConector } from 'connector/Server'

const APP_LIST = (server: ServerConector): Apps.ListMethod => () => server.send({
  endpoint: 'apps',
  method: 'get'
})

export { APP_LIST }