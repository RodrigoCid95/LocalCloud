import type { ServerConector } from 'connector/Server'

const PROFILE_INFO = (server: ServerConector): Profile.InfoMethod => () => server.send<Users.User>({
  endpoint: 'profile',
  method: 'get'
})

export { PROFILE_INFO }