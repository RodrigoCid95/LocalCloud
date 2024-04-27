import type { ServerConector } from 'connector/Server'

const APP_LIST_BY_UUID = (server: ServerConector): Apps.ListByUUIDMethod => uuid => server.send({
  endpoint: `apps/${uuid}`,
  method: 'get'
})

export { APP_LIST_BY_UUID }