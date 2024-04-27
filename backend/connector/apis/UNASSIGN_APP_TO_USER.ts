import type { ServerConector } from 'connector/Server'

const UNASSIGN_APP_TO_USER = (server: ServerConector): Users.UnassignAppMethod => (uuid, package_name) => server.send({
  endpoint: 'users/unassign-app',
  method: 'post',
  data: { uuid, package_name }
})

export { UNASSIGN_APP_TO_USER }