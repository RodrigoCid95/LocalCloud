import type { ServerConector } from 'connector/Server'

const ASSIGN_APP_TO_USER = (server: ServerConector): Users.AssignAppMethod => (uuid, package_name) => server.send({
  endpoint: 'users/assign-app',
  method: 'post',
  data: { uuid, package_name }
})

export { ASSIGN_APP_TO_USER }