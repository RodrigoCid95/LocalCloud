import type { ServerConector } from 'connector/Server'

const INSTALL_APP = (server: ServerConector): Apps.InstallMethod => file => server.createUploader({
  api: 'apps',
  path: [],
  file: { name: 'package_zip', file }
})

export { INSTALL_APP }