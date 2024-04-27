import type { ServerConector } from 'connector/Server'

const UNINSTALL_APP = (server: ServerConector): Apps.UninstallMethod => package_name => server.send({
  endpoint: `apps/${package_name}`,
  method: 'delete'
})

export { UNINSTALL_APP }