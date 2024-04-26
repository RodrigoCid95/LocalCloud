import type { ServerConector } from 'connector/Server'

const PROFILE_APP_LIST = (server: ServerConector): Profile.ListAppsMethod => () => server.send<Apps.App[]>({
  endpoint: 'profile/apps',
  method: 'get'
})

export { PROFILE_APP_LIST }